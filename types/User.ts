
// Types utilisateur
// Décrit la structure d'un objet User et l'état d'authentification
export interface User {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin';
  photoProfil?: string; // URL image profil
  photoCouverture?: string; // URL image couverture
  restaurants: number; // nombre de restaurants visités
  points: number; // points de fidélité
  avis: number; // nombre d'avis laissés
  cuisinesPreferees: string[];
  dernierVisites: VisiteRestaurant[];
  bio?: string;
}

export interface VisiteRestaurant {
  id: string;
  nom: string;
  cuisine: string;
  date: string; // format ISO recommandé
}

export interface AuthState {
  isAuthReady: boolean;
  isAuthenticated: boolean;
  user: User | null;
}
