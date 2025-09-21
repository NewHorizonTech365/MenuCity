
// AuthProvider
// Fournit un contexte React pour l'authentification afin que n'importe quel
// composant puisse accéder à l'utilisateur courant et aux fonctions login/logout.
// L'implémentation concrète est fournie par le hook `useAuth` (hooks/useAuth.ts).
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';
import { AuthState, User } from '../types/User';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (nom: string, email: string, password: string, telephone: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

// Context initial (undefined tant que non fourni)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Récupère l'implémentation d'auth via le hook local (mock)
  const auth = useAuthHook();

  // Petit log utile en dev pour voir l'état d'auth à l'initialisation
  console.log('AuthProvider - Current auth state:', {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user ? { id: auth.user.id, nom: auth.user.nom } : null
  });

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook helper pour consommer le contexte plus facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
