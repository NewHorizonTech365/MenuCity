import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "../types/User";

type Role = "user" | "admin";

const toRole = (value: unknown): Role => (value === "admin" ? "admin" : "user");

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
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
      return;
    }

    if (authUser) {
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
      return;
    }

    setUser(null);
    setIsAuthenticated(false);
    setRole(null);
  }, []);

  const checkUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setRole(null);
    }
  }, [loadProfile]);

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setRole(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [checkUser, loadProfile]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return !error;
  };

  const register = async (
    nom: string,
    email: string,
    password: string,
    telephone: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          telephone,
        },
      },
    });

    if (error) return false;

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          role: "user",
        },
        { onConflict: "id" }
      );
    }

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (patch.role) setRole(patch.role);
      return next;
    });

    void (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const profilePatch: Record<string, unknown> = {};
      if (patch.email !== undefined) profilePatch.email = patch.email;
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
    })();
  };

  return {
    user,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };
};
