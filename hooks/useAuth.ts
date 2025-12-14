import { useState } from "react";
import { User, AuthState } from "../types/User";

const ADMIN_PIN = "2424";

const mockUser: User = {
  id: "1",
  nom: "Amara Mukendi",
  email: "amara.mukendi@example.com",
  telephone: "+243 234 5678",
  photoProfil:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  photoCouverture:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop",
  restaurants: 27,
  points: 340,
  avis: 3,
  cuisinesPreferees: ["Congolaise", "Fusion Africaine", "Grillades"],
  historiqueVisites: [
    {
      id: "1",
      nom: "Chez Mama Ngozi",
      cuisine: "Congolaise",
      date: "2024-01-15",
    },
  ],
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  // ---------------------------
  // 🔐 LOGIN (user + admin)
  // ---------------------------
  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {

        // 🔐 LOGIN ADMIN
        if (
          email.toLowerCase() === "admin@foodlubumbashi.com" &&
          password === ADMIN_PIN
        ) {
          setAuthState({
            isAuthenticated: true,
            user: {
              id: "admin",
              nom: "Administrateur",
              email: "admin@foodlubumbashi.com",
              telephone: "",
              role: "admin",       // 🔥 OBLIGATOIRE !!
            } as User,
          });

          console.log("ADMIN connecté ✔");
          resolve(true);
          return;
        }

        // 🔓 LOGIN USER NORMAL
        setAuthState({
          isAuthenticated: true,
          user: {
            ...mockUser,
            role: "user",
          } as User,
        });

        resolve(true);
      }, 800);
    });
  };

  // ---------------------------
  // REGISTER
  // ---------------------------
  const register = async (
    nom: string,
    email: string,
    password: string,
    telephone: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          ...mockUser,
          nom,
          email,
          telephone,
          restaurants: 0,
          points: 0,
          avis: 0,
          cuisinesPreferees: [],
          historiqueVisites: [],
          role: "user",
        };

        setAuthState({
          isAuthenticated: true,
          user: newUser,
        });

        resolve(true);
      }, 800);
    });
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  // ---------------------------
  // UPDATE USER
  // ---------------------------
  const updateUser = (updatedUser: Partial<User>) => {
    if (authState.user) {
      setAuthState((prev) => ({
        ...prev,
        user: { ...prev.user!, ...updatedUser },
      }));
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
};