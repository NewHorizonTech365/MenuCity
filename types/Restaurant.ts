
// Types pour les restaurants et invitations
// Utilisez ces interfaces pour typer les données venant du backend
export interface Restaurant {
  id: string;
  nom: string;
  cuisine: string; // ex: 'Congolaise', 'Italienne'
  adresse: string;
  telephone: string;
  image: string; // URL
  note: number; // note moyenne (ex: 4.5)
  prixMoyen: string; // ex: '€', '$$'
  description: string;
  horaires: string; // texte libre
  specialites: string[];
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
