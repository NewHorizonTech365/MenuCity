import React, { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook, type AuthResult } from "../hooks/useAuth";
import { AuthState, User } from "../types/User";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    nom: string,
    email: string,
    password: string,
    telephone: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthHook();

  return <AuthContext.Provider value={{ ...auth }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
