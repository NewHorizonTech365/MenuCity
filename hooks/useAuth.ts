
// useAuth (hook)
// Hook local qui fournit un état d'authentification mocké pour le développement.
// Remplacez cette implémentation par des appels réels à votre backend
// (ex: fetch/Axios vers une API REST) lorsque vous intégrez l'auth réelle.
import { useState, useEffect } from 'react';
import { User, AuthState } from '../types/User';

// Mock user data
const mockUser: User = {
  id: '1',
  nom: 'Amara Mukendi',
  email: 'amara.mukendi@example.com',
  telephone: '+243 234 5678',
  photoProfil: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  photoCouverture: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop',
  restaurants: 27,
  points: 340,
  avis: 3,
  cuisinesPreferees: ['Congolaise', 'Fusion Africaine', 'Grillades'],
  historiqueVisites: [
    {
      id: '1',
      nom: 'Chez Mama Ngozi',
      cuisine: 'Congolaise',
      date: '2024-01-15'
    }
  ]
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  // Mock login: simule un délai réseau et connecte l'utilisateur mock
  const login = (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Tentative de connexion:', email);
        setAuthState({
          isAuthenticated: true,
          user: mockUser
        });
        resolve(true);
      }, 1000);
    });
  };

  // Mock register : crée un nouvel utilisateur basé sur le mockUser
  const register = (nom: string, email: string, password: string, telephone: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Tentative d\'inscription:', nom, email);
        const newUser: User = {
          ...mockUser,
          nom,
          email,
          telephone,
          restaurants: 0,
          points: 0,
          avis: 0,
          cuisinesPreferees: [],
          historiqueVisites: []
        };
        setAuthState({
          isAuthenticated: true,
          user: newUser
        });
        resolve(true);
      }, 1000);
    });
  };

  // Déconnexion simple : remet l'état auth à null
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  };

  // Met à jour l'objet user en mémoire (utile pour les tests)
  const updateUser = (updatedUser: Partial<User>) => {
    if (authState.user) {
      setAuthState({
        ...authState,
        user: { ...authState.user, ...updatedUser }
      });
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser
  };
};
