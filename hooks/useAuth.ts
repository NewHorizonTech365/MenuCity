import { isClerkAPIResponseError, useAuth as useClerkAuth, useUser } from "@clerk/expo";
import { useSignIn, useSignUp } from "@clerk/expo/legacy";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, isApiConfigured, type TokenGetter } from "../lib/api";
import {
  checkRateLimit,
  isCommonPassword,
  logAuthEvent,
  resetUserRateLimit,
  validateEmailFormat,
  validatePhoneFormat,
} from "../lib/authSecurity";
import { validatePassword } from "../lib/passwordValidator";
import type { ProfileDto } from "../types/Api";
import type { User } from "../types/User";

type Role = "user" | "admin";
type AuthErrorCode =
  | "invalid_credentials"
  | "account_not_found"
  | "email_not_confirmed"
  | "additional_verification_required"
  | "configuration_error"
  | "network_error"
  | "timeout"
  | "rate_limited"
  | "weak_password"
  | "invalid_email"
  | "invalid_phone"
  | "email_already_exists"
  | "invalid_code"
  | "unknown";

export type AuthResult = {
  ok: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
  code?: AuthErrorCode;
};
const clerkMessage = (raw: unknown) => {
  if (isClerkAPIResponseError(raw)) {
    return raw.errors[0]?.longMessage || raw.errors[0]?.message || "L’authentification a échoué.";
  }
  return raw instanceof Error ? raw.message : "L’authentification a échoué.";
};

const normalizeError = (raw: unknown): { code: AuthErrorCode; message: string } => {
  const message = clerkMessage(raw);
  const lower = message.toLowerCase();
  const clerkCode = isClerkAPIResponseError(raw) ? raw.errors[0]?.code || "" : "";

  if (clerkCode === "form_identifier_not_found") {
    return {
      code: "account_not_found",
      message: "Aucun compte Clerk ne correspond a cet e-mail. Les anciens comptes Supabase ne sont pas migres : creez un nouveau compte.",
    };
  }
  if (clerkCode === "form_password_incorrect") {
    return { code: "invalid_credentials", message: "E-mail ou mot de passe incorrect." };
  }
  if (clerkCode === "form_identifier_exists") {
    return { code: "email_already_exists", message: "Cet e-mail est deja enregistre. Essayez de vous connecter." };
  }
  if (clerkCode.includes("verification_failed") || clerkCode.includes("verification_expired")) {
    return { code: "invalid_code", message: "Le code est incorrect ou a expire." };
  }
  if (clerkCode.includes("password") && clerkCode !== "form_password_incorrect") {
    return { code: "weak_password", message };
  }
  if (clerkCode.includes("captcha")) {
    return {
      code: "configuration_error",
      message: "La verification anti-robot Clerk a echoue. Rechargez l'application puis reessayez.",
    };
  }
  if (lower.includes("password") && (lower.includes("incorrect") || lower.includes("invalid"))) {
    return { code: "invalid_credentials", message: "Email ou mot de passe incorrect." };
  }
  if (lower.includes("already") || lower.includes("taken")) {
    return { code: "email_already_exists", message: "Cet email est déjà enregistré." };
  }
  if (lower.includes("code") && (lower.includes("incorrect") || lower.includes("invalid") || lower.includes("expired"))) {
    return { code: "invalid_code", message: "Le code est incorrect ou a expiré." };
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return { code: "network_error", message: "Réseau indisponible. Vérifiez Internet puis réessayez." };
  }
  if (lower.includes("rate") || lower.includes("too many")) {
    return { code: "rate_limited", message: "Trop de tentatives. Réessayez dans quelques minutes." };
  }
  return { code: "unknown", message };
};

const profileToUser = (
  profile: ProfileDto | null,
  clerkUser: NonNullable<ReturnType<typeof useUser>["user"]>,
): User => ({
  id: clerkUser.id,
  nom: clerkUser.fullName || clerkUser.firstName || "",
  email: clerkUser.primaryEmailAddress?.emailAddress || "",
  telephone: profile?.phone || String(clerkUser.unsafeMetadata?.phone || ""),
  role: profile?.role || "user",
  photoProfil: profile?.avatarUrl || clerkUser.imageUrl,
  photoCouverture: profile?.coverUrl || undefined,
  restaurants: profile?.restaurantsVisited || 0,
  points: profile?.points || 0,
  avis: profile?.reviewsCount || 0,
  cuisinesPreferees: profile?.preferredCuisines || [],
  dernierVisites: (profile?.recentVisits || []).map((visit) => ({
    id: visit.id,
    nom: visit.name,
    cuisine: visit.cuisine,
    date: visit.date,
  })),
  bio: profile?.bio || "",
});

const DEVELOPMENT_ADMIN: User = {
  id: "development-admin",
  nom: "Administrateur MenuCity",
  email: "admin.dev@menucity.local",
  telephone: "+243 000 000 000",
  role: "admin",
  restaurants: 0,
  points: 0,
  avis: 0,
  cuisinesPreferees: [],
  dernierVisites: [],
  bio: "Session locale de developpement",
};

export const useAuth = () => {
  const clerkAuth = useClerkAuth();
  const clerkAuthRef = useRef(clerkAuth);
  clerkAuthRef.current = clerkAuth;
  const clerkUserState = useUser();
  const signInState = useSignIn();
  const signUpState = useSignUp();
  const [user, setUser] = useState<User | null>(null);
  const [developmentUser, setDevelopmentUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loginFailures, setLoginFailures] = useState(0);

  const getAuthToken: TokenGetter = useCallback(async () => {
    return (await clerkAuthRef.current.getToken()) || null;
  }, []);

  const loadProfile = useCallback(async () => {
    if (!clerkAuth.isLoaded || !clerkAuth.isSignedIn || !clerkUserState.user) {
      setUser(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      let profile = isApiConfigured
        ? await apiRequest<ProfileDto>("/v1/me", { getToken: getAuthToken })
        : null;
      const clerkPhone = String(clerkUserState.user.unsafeMetadata?.phone || "").trim();
      if (profile && !profile.phone && clerkPhone) {
        profile = await apiRequest<ProfileDto>("/v1/me", {
          method: "PATCH",
          getToken: getAuthToken,
          body: { phone: clerkPhone },
        });
      }
      setUser(profileToUser(profile, clerkUserState.user));
    } catch (error) {
      console.warn("Impossible de synchroniser le profil MenuCity", normalizeError(error).code);
      setUser(profileToUser(null, clerkUserState.user));
    } finally {
      setProfileLoading(false);
    }
  }, [clerkAuth.isLoaded, clerkAuth.isSignedIn, clerkUserState.user, getAuthToken]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimit = checkRateLimit(normalizedEmail, "login");
    if (!rateLimit.allowed) return { ok: false, code: "rate_limited", message: rateLimit.message };
    if (!validateEmailFormat(normalizedEmail)) return { ok: false, code: "invalid_email", message: "Format d’email invalide." };
    if (!signInState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };

    try {
      const result = await signInState.signIn.create({ identifier: normalizedEmail, password });
      if (result.status !== "complete" || !result.createdSessionId) {
        return {
          ok: false,
          code: "additional_verification_required",
          message: "Clerk demande une verification supplementaire qui n'est pas encore activee dans MenuCity. Utilisez pour ce test un compte e-mail et mot de passe sans verification telephone obligatoire.",
        };
      }
      await signInState.setActive({ session: result.createdSessionId });
      setDevelopmentUser(null);
      resetUserRateLimit(normalizedEmail);
      setLoginFailures(0);
      logAuthEvent("login", normalizedEmail, "success");
      return { ok: true };
    } catch (error) {
      const normalized = normalizeError(error);
      setLoginFailures((count) => count + 1);
      logAuthEvent("login", normalizedEmail, "failure", normalized.code);
      return { ok: false, ...normalized };
    }
  };

  const register = async (nom: string, email: string, password: string, telephone: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = telephone.trim();
    const rateLimit = checkRateLimit(normalizedEmail, "register");
    if (!rateLimit.allowed) return { ok: false, code: "rate_limited", message: rateLimit.message };
    if (!validateEmailFormat(normalizedEmail)) return { ok: false, code: "invalid_email", message: "Format d’email invalide." };
    if (!validatePhoneFormat(normalizedPhone)) return { ok: false, code: "invalid_phone", message: "Numéro de téléphone invalide (9 à 15 chiffres)." };
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid || isCommonPassword(password)) {
      return { ok: false, code: "weak_password", message: passwordResult.errors[0] || "Choisissez un mot de passe plus robuste." };
    }
    if (!signUpState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };

    try {
      const parts = nom.trim().split(/\s+/);
      const result = await signUpState.signUp.create({
        emailAddress: normalizedEmail,
        password,
        firstName: parts.shift() || nom.trim(),
        lastName: parts.join(" ") || undefined,
        unsafeMetadata: { phone: normalizedPhone },
      });

      if (result.status === "complete" && result.createdSessionId) {
        await signUpState.setActive({ session: result.createdSessionId });
        setDevelopmentUser(null);
        resetUserRateLimit(normalizedEmail);
        logAuthEvent("register", normalizedEmail, "success");
        return { ok: true };
      }

      if (result.missingFields.includes("phone_number")) {
        return {
          ok: false,
          code: "configuration_error",
          message: "Dans Clerk, le numero de telephone est obligatoire pour l'authentification. Rendez-le facultatif pour cette phase : MenuCity utilise actuellement l'e-mail et le code OTP.",
        };
      }

      await signUpState.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      logAuthEvent("register", normalizedEmail, "success");
      return { ok: true, requiresEmailConfirmation: true, code: "email_not_confirmed", message: "Un code de vérification a été envoyé par e-mail." };
    } catch (error) {
      const normalized = normalizeError(error);
      logAuthEvent("register", normalizedEmail, "failure", normalized.code);
      return { ok: false, ...normalized };
    }
  };

  const verifyEmailCode = async (code: string): Promise<AuthResult> => {
    if (!signUpState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };
    try {
      const result = await signUpState.signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (result.status !== "complete" || !result.createdSessionId) {
        return { ok: false, code: "invalid_code", message: "La vérification n’est pas terminée." };
      }
      await signUpState.setActive({ session: result.createdSessionId });
      return { ok: true };
    } catch (error) {
      return { ok: false, ...normalizeError(error) };
    }
  };

  const resendConfirmationEmail = async (_email: string): Promise<AuthResult> => {
    if (!signUpState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };
    try {
      await signUpState.signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      return { ok: true, message: "Un nouveau code a été envoyé." };
    } catch (error) {
      return { ok: false, ...normalizeError(error) };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmailFormat(normalizedEmail)) return { ok: false, code: "invalid_email", message: "Format d’email invalide." };
    if (!signInState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };
    try {
      await signInState.signIn.create({ strategy: "reset_password_email_code", identifier: normalizedEmail });
      return { ok: true, message: "Un code de réinitialisation a été envoyé." };
    } catch (error) {
      return { ok: false, ...normalizeError(error) };
    }
  };

  const resetPassword = async (code: string, password: string): Promise<AuthResult> => {
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid || isCommonPassword(password)) {
      return { ok: false, code: "weak_password", message: passwordResult.errors[0] || "Choisissez un mot de passe plus robuste." };
    }
    if (!signInState.isLoaded) return { ok: false, code: "unknown", message: "Clerk est encore en cours de chargement." };
    try {
      const verified = await signInState.signIn.attemptFirstFactor({ strategy: "reset_password_email_code", code: code.trim() });
      const result = await verified.resetPassword({ password });
      if (result.status !== "complete" || !result.createdSessionId) {
        return { ok: false, code: "unknown", message: "La réinitialisation n’a pas pu être finalisée." };
      }
      await signInState.setActive({ session: result.createdSessionId });
      return { ok: true };
    } catch (error) {
      return { ok: false, ...normalizeError(error) };
    }
  };

  const logout = async () => {
    setDevelopmentUser(null);
    if (clerkAuth.isSignedIn) await clerkAuth.signOut();
    setLoginFailures(0);
    setUser(null);
  };

  const updateUser = async (patch: Partial<User>) => {
    if (developmentUser) {
      setDevelopmentUser((current) => current ? { ...current, ...patch, role: "admin" } : current);
      return;
    }
    if (!clerkUserState.user) throw new Error("Une connexion est requise.");
    if (patch.nom !== undefined) {
      const parts = patch.nom.trim().split(/\s+/);
      await clerkUserState.user.update({ firstName: parts.shift() || "", lastName: parts.join(" ") || undefined });
    }
    if (isApiConfigured) {
      await apiRequest<ProfileDto>("/v1/me", {
        method: "PATCH",
        getToken: getAuthToken,
        body: {
          ...(patch.telephone === undefined ? {} : { phone: patch.telephone }),
          ...(patch.bio === undefined ? {} : { bio: patch.bio }),
          ...(patch.photoProfil === undefined ? {} : { avatarUrl: patch.photoProfil || null }),
          ...(patch.photoCouverture === undefined ? {} : { coverUrl: patch.photoCouverture || null }),
          ...(patch.cuisinesPreferees === undefined ? {} : { preferredCuisines: patch.cuisinesPreferees }),
        },
      });
    }
    await loadProfile();
  };

  const startDevelopmentSession = () => {
    if (!__DEV__) return;
    setDevelopmentUser({ ...DEVELOPMENT_ADMIN });
    setLoginFailures(0);
  };

  const activeUser = developmentUser || user;
  const isDevelopmentSession = Boolean(__DEV__ && developmentUser);

  return {
    isAuthReady: isDevelopmentSession || (clerkAuth.isLoaded && !profileLoading),
    isAuthenticated: isDevelopmentSession || Boolean(clerkAuth.isLoaded && clerkAuth.isSignedIn),
    isDevelopmentSession,
    user: activeUser,
    role: activeUser?.role || (null as Role | null),
    loginFailures,
    getAuthToken,
    login,
    register,
    verifyEmailCode,
    resendConfirmationEmail,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    startDevelopmentSession,
    reloadProfile: loadProfile,
  };
};
