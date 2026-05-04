import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../types/User";

type Role = "user" | "admin";
type AuthErrorCode =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "network_error"
  | "timeout"
  | "rate_limited"
  | "unknown";
export type AuthResult = {
  ok: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
  code?: AuthErrorCode;
};

const AUTH_TIMEOUT_MS = 15000;

const withTimeout = async <T>(promise: Promise<T>, message: string): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), AUTH_TIMEOUT_MS);
    }),
  ]);
};

const toRole = (value: unknown): Role => (value === "admin" ? "admin" : "user");
const logAuthEvent = (
  event: string,
  payload: Record<string, unknown> = {}
) => {
  console.log(
    JSON.stringify({
      scope: "auth",
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    })
  );
};
const normalizeError = (raw: unknown): { code: AuthErrorCode; message: string } => {
  const message =
    typeof raw === "string"
      ? raw
      : typeof (raw as any)?.message === "string"
        ? (raw as any).message
        : "Une erreur inconnue est survenue.";
  const lower = message.toLowerCase();

  if (lower.includes("timed out") || lower.includes("trop longue")) {
    return {
      code: "timeout",
      message: "Connexion trop longue. Verifiez votre connexion Internet puis reessayez.",
    };
  }
  if (lower.includes("invalid login credentials")) {
    return {
      code: "invalid_credentials",
      message: "Email ou mot de passe incorrect.",
    };
  }
  if (lower.includes("email not confirmed")) {
    return {
      code: "email_not_confirmed",
      message: "Votre email n'est pas confirme. Verifiez votre boite mail.",
    };
  }
  if (lower.includes("rate limit")) {
    return {
      code: "rate_limited",
      message: "Trop de tentatives. Attendez quelques minutes puis reessayez.",
    };
  }
  if (lower.includes("network request failed") || lower.includes("fetch failed")) {
    return {
      code: "network_error",
      message: "Reseau indisponible. Verifiez Internet puis reessayez.",
    };
  }

  return { code: "unknown", message };
};

export const useAuth = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [loginFailures, setLoginFailures] = useState(0);

  const setSignedOutState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
    setIsAuthReady(true);
  }, []);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const metadata = authUser?.user_metadata ?? {};

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        const normalizedUser: User = {
          id: data.id,
          nom: data.nom ?? metadata.nom ?? "",
          email: data.email ?? authUser?.email ?? "",
          telephone: data.telephone ?? metadata.telephone ?? "",
          role: toRole(data.role),
          restaurants: data.restaurants ?? 0,
          points: data.points ?? 0,
          avis: data.avis ?? 0,
          cuisinesPreferees: data.cuisinesPreferees ?? [],
          dernierVisites: data.dernierVisites ?? [],
          photoProfil: data.photoProfil ?? metadata.photoProfil,
          photoCouverture: data.photoCouverture ?? metadata.photoCouverture,
          bio: data.bio ?? metadata.bio,
        };

        setUser(normalizedUser);
        setRole(normalizedUser.role);
        setIsAuthenticated(true);
        setIsAuthReady(true);
        return;
      }

      if (authUser) {
        const profileMissing = error?.code === "PGRST116";
        if (profileMissing) {
          await supabase.from("profiles").upsert(
            {
              id: authUser.id,
              email: authUser.email ?? "",
              role: "user",
            },
            { onConflict: "id" }
          );
        }

        setUser({
          id: authUser.id,
          nom: metadata.nom ?? "",
          email: authUser.email ?? "",
          telephone: metadata.telephone ?? "",
          role: "user",
          restaurants: 0,
          points: 0,
          avis: 0,
          cuisinesPreferees: [],
          dernierVisites: [],
          photoProfil: metadata.photoProfil,
          photoCouverture: metadata.photoCouverture,
          bio: metadata.bio,
        });
        setRole("user");
        setIsAuthenticated(true);
        setIsAuthReady(true);
        return;
      }

      setSignedOutState();
    } catch {
      logAuthEvent("load_profile_failed", { userId });
      setSignedOutState();
    }
  }, [setSignedOutState]);

  const checkUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setSignedOutState();
      }
    } catch {
      logAuthEvent("check_user_failed");
      setSignedOutState();
    }
  }, [loadProfile, setSignedOutState]);

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      try {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setSignedOutState();
        }
      } catch {
        logAuthEvent("auth_state_listener_failed");
        setSignedOutState();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [checkUser, loadProfile, setSignedOutState]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    let data;
    let error;
    try {
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        }),
        "Connexion trop longue. Verifiez votre connexion Internet puis reessayez."
      );
      data = result.data;
      error = result.error;
    } catch (e: any) {
      const normalized = normalizeError(e);
      logAuthEvent("login_failed", { code: normalized.code });
      setLoginFailures((count) => count + 1);
      return {
        ok: false,
        code: normalized.code,
        message: normalized.message,
      };
    }

    if (error) {
      const normalized = normalizeError(error);
      logAuthEvent("login_failed", { code: normalized.code });
      setLoginFailures((count) => count + 1);
      return {
        ok: false,
        code: normalized.code,
        message: normalized.message,
      };
    }

    if (!data.session) {
      logAuthEvent("login_failed", { code: "email_not_confirmed" });
      setLoginFailures((count) => count + 1);
      return {
        ok: false,
        code: "email_not_confirmed",
        message: "Session non active. Verifie votre email puis reconnectez-vous.",
      };
    }

    setLoginFailures(0);
    logAuthEvent("login_success");
    return { ok: true };
  };

  const register = async (
    nom: string,
    email: string,
    password: string,
    telephone: string
  ): Promise<AuthResult> => {
    let data;
    let error;
    try {
      const result = await withTimeout(
        supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              nom,
              telephone,
            },
          },
        }),
        "Inscription trop longue. Verifiez votre connexion Internet puis reessayez."
      );
      data = result.data;
      error = result.error;
    } catch (e: any) {
      const normalized = normalizeError(e);
      logAuthEvent("register_failed", { code: normalized.code });
      return {
        ok: false,
        code: normalized.code,
        message: normalized.message,
      };
    }

    if (error) {
      const normalized = normalizeError(error);
      logAuthEvent("register_failed", { code: normalized.code });
      return {
        ok: false,
        code: normalized.code,
        message: normalized.message,
      };
    }

    if (!data.session) {
      logAuthEvent("register_pending_email_confirmation");
      return {
        ok: true,
        requiresEmailConfirmation: true,
        code: "email_not_confirmed",
        message: "Compte cree. Confirmez votre email puis connectez-vous.",
      };
    }

    logAuthEvent("register_success");
    return { ok: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      logAuthEvent("logout_success");
    } finally {
      setLoginFailures(0);
      setSignedOutState();
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      const redirectTo = "menucity://auth/reset-password";
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo }),
        "Operation trop longue. Verifiez votre connexion Internet puis reessayez."
      );

      if (error) {
        const normalized = normalizeError(error);
        logAuthEvent("forgot_password_failed", { code: normalized.code });
        return { ok: false, code: normalized.code, message: normalized.message };
      }
      logAuthEvent("forgot_password_sent");
      return { ok: true, message: "Email de reinitialisation envoye." };
    } catch (e: unknown) {
      const normalized = normalizeError(e);
      logAuthEvent("forgot_password_failed", { code: normalized.code });
      return { ok: false, code: normalized.code, message: normalized.message };
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await withTimeout(
        supabase.auth.resend({
          type: "signup",
          email: email.trim().toLowerCase(),
        }),
        "Operation trop longue. Verifiez votre connexion Internet puis reessayez."
      );

      if (error) {
        const normalized = normalizeError(error);
        logAuthEvent("resend_confirmation_failed", { code: normalized.code });
        return { ok: false, code: normalized.code, message: normalized.message };
      }
      logAuthEvent("resend_confirmation_sent");
      return { ok: true, message: "Email de confirmation renvoye." };
    } catch (e: unknown) {
      const normalized = normalizeError(e);
      logAuthEvent("resend_confirmation_failed", { code: normalized.code });
      return { ok: false, code: normalized.code, message: normalized.message };
    }
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (patch.role) setRole(patch.role);
      return next;
    });

    void (async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser) return;

        const profilePatch: Record<string, unknown> = {};
        if (patch.role !== undefined) profilePatch.role = patch.role;

        if (Object.keys(profilePatch).length > 0) {
          await supabase.from("profiles").update(profilePatch).eq("id", authUser.id);
        }

        const metadataPatch: Record<string, unknown> = {};
        if (patch.nom !== undefined) metadataPatch.nom = patch.nom;
        if (patch.telephone !== undefined) metadataPatch.telephone = patch.telephone;
        if (patch.bio !== undefined) metadataPatch.bio = patch.bio;
        if (patch.photoProfil !== undefined) metadataPatch.photoProfil = patch.photoProfil;
        if (patch.photoCouverture !== undefined) metadataPatch.photoCouverture = patch.photoCouverture;

        if (Object.keys(metadataPatch).length > 0) {
          await supabase.auth.updateUser({
            data: metadataPatch,
          });
        }
      } catch {
        // ignore network errors here to keep UI responsive
      }
    })();
  };

  return {
    isAuthReady,
    user,
    role,
    isAuthenticated,
    loginFailures,
    login,
    register,
    logout,
    forgotPassword,
    resendConfirmationEmail,
    updateUser,
  };
};
