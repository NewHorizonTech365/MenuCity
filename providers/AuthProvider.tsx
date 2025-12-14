// AuthProvider.tsx — version avec ROLE + PIN admin
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { AuthState, User } from '../types/User';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (nom: string, email: string, password: string, telephone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;

  // ➜ NOUVEAU : connexion admin
  loginAdmin: (pin: string) => Promise<boolean>;
}

// Storage keys
const ADMIN_ROLE_KEY = 'APP_ADMIN_ROLE';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthHook();

  // ---------- PERSISTENCE DU ROLE ADMIN ----------
  useEffect(() => {
    (async () => {
      const storedRole = await AsyncStorage.getItem(ADMIN_ROLE_KEY);

      if (storedRole === 'admin') {
        // On force l'utilisateur courant à être admin
        auth.updateUser({ role: 'admin' } as any);
      }
    })();
  }, []);

  // ---------- NOUVEAU : LOGIN ADMIN AVEC PIN ----------
  const loginAdmin = async (pin: string): Promise<boolean> => {
    const ADMIN_PIN = "1234"; // <-- change ici le PIN admin

    if (pin === ADMIN_PIN) {
      await AsyncStorage.setItem(ADMIN_ROLE_KEY, 'admin');

      auth.updateUser({
        role: "admin",
      } as any);

      return true;
    }

    return false;
  };

  // ---------- LOGOUT : doit aussi retirer le rôle ----------
  const logout = () => {
    AsyncStorage.removeItem(ADMIN_ROLE_KEY);
    auth.logout();
  };

  // ---------- updateUser (ajoute propagation du rôle) ----------
  const updateUser = (updated: Partial<User>) => {
    auth.updateUser(updated);

    // si le rôle change → met à jour le storage
    if (updated.role === 'admin') {
      AsyncStorage.setItem(ADMIN_ROLE_KEY, 'admin');
    }
    if (updated.role === 'user') {
      AsyncStorage.removeItem(ADMIN_ROLE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        loginAdmin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};