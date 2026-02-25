import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../types/User";

type Role = "user" | "admin";
export type AuthResult = {
  ok: boolean;
  message?: string;
  requiresEmailConfirmation?: boolean;
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

export const useAuth = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

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
      return {
        ok: false,
        message: e?.message || "Connexion impossible pour le moment.",
      };
    }

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    if (!data.session) {
      return {
        ok: false,
        message: "Session non active. Verifie votre email puis reconnectez-vous.",
      };
    }

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
      return {
        ok: false,
        message: e?.message || "Inscription impossible pour le moment.",
      };
    }

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    if (!data.session) {
      return {
        ok: true,
        requiresEmailConfirmation: true,
        message: "Compte cree. Confirmez votre email puis connectez-vous.",
      };
    }

    return { ok: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSignedOutState();
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
    login,
    register,
    logout,
    updateUser,
  };
};
