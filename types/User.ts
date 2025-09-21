
// Types utilisateur
// Décrit la structure d'un objet User et l'état d'authentification
export interface User {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  photoProfil?: string; // URL image profil
  photoCouverture?: string; // URL image couverture
  restaurants: number; // nombre de restaurants visités
  points: number; // points de fidélité
  avis: number; // nombre d'avis laissés
  cuisinesPreferees: string[];
  historiqueVisites: VisiteRestaurant[];
}

export interface VisiteRestaurant {
  id: string;
  nom: string;
  cuisine: string;
  date: string; // format ISO recommandé
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
