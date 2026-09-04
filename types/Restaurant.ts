export type RestaurantService = 'Livraison' | 'Parking' | 'Réservation' | 'Terrasse' | 'À emporter';
export type RestaurantPaymentMethod = 'Espèces' | 'Carte bancaire' | 'Airtel Money' | 'M-Pesa' | 'Orange Money';
export type RestaurantStatus = 'draft' | 'published' | 'archived';

export interface RestaurantOpeningPeriod {
  days: number[];
  opensAt: string;
  closesAt: string;
}

export interface Restaurant {
  latitude?: number;
  longitude?: number;
  id: string;
  nom: string;
  cuisine: string;              // ex: 'Congolaise', 'Italienne'
  adresse: string;
  telephone: string;
  image: string;                // (garde la principale)
  logo: string;                 // <<< ajouté
  photos: string[];             // <<< ajouté = carrousel
  note: number;                 // note moyenne
  prixMoyen: string;            // '$$' etc
  prixMoyenCdf?: string;
  description: string;
  horaires: string;
  openingPeriods?: RestaurantOpeningPeriod[];
  specialites: string[];
  quartier?: string;
  commune?: string;
  repere?: string;
  services?: RestaurantService[];
  paymentMethods?: RestaurantPaymentMethod[];
  isVerified?: boolean;
  lastVerifiedAt?: string;
  status?: RestaurantStatus;

  menu?: {
    id: string;
    nom: string;
    description?: string;
    prix: string;
    photosMenu?: string[];
  }[];
}

export interface Invitation {
  id: string;
  restaurantId: string;
  invitePar: string; // utilisateur qui envoie
  inviteEmail: string;
  inviteNom?: string;
  message: string;
  dateProposee: string;
  heureProposee: string;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  dateCreation: string;
}
