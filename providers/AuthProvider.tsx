import React, { createContext, useContext, type ReactNode } from "react";
import { useAuth as useAuthHook, type AuthResult } from "../hooks/useAuth";
import type { TokenGetter } from "../lib/api";
import type { AuthState, User } from "../types/User";

interface AuthContextType extends AuthState {
  role: "user" | "admin" | null;
  isDevelopmentSession: boolean;
  startDevelopmentSession: () => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (nom: string, email: string, password: string, telephone: string) => Promise<AuthResult>;
  verifyEmailCode: (code: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (code: string, password: string) => Promise<AuthResult>;
  resendConfirmationEmail: (email: string) => Promise<AuthResult>;
  loginFailures: number;
  getAuthToken: TokenGetter;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return context;
};
