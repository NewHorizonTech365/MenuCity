// Types pour les restaurants
// Backend pourra plus tard alimenter ces champs.

export interface Restaurant {
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
  description: string;
  horaires: string;
  specialites: string[];

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
