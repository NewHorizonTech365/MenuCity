import { Restaurant } from '../types/Restaurant';

export const restaurantsLubumbashi: Restaurant[] = [
  {
    id: "1",
    nom: "Chez Maman Chérie",
    logo: "https://images.unsplash.com/photo-1584463609561-6b65e9b7c63d?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200",
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200",
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200"
    ],
    cuisine: "Congolaise Traditionnelle",
    adresse: "Avenue Mobutu, Lubumbashi",
    telephone: "+243 997 123 456",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    note: 4.8,
    prixMoyen: "15-25 USD",
    description: "Restaurant familial servant des plats traditionnels congolais dans une ambiance chaleureuse.",
    horaires: "11h00 - 22h00",
    specialites: ["Fufu", "Pondu", "Poisson salé", "Chikwangue"],
    menu: [
      { id: '1', nom:"Fufu + poisson salé", prix:"12 USD" },
      { id: '1', nom:"Pondu viande", prix:"10 USD" },
      { id: '1', nom:"Chikwangue grillée", prix:"6 USD" },
    ]
  },
  {
    id: "2",
    nom: "Le Baobab Doré",
    logo: "https://images.unsplash.com/photo-1604147706283-d7113f3e720d?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200",
      "https://images.unsplash.com/photo-1533777324565-a040eb52fac0?w=1200",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
      "https://images.unsplash.com/photo-1544144169-00d30e30b6d0?w=1200"
    ],
    cuisine: "Africaine Fusion",
    adresse: "Quartier Golf, Lubumbashi",
    telephone: "+243 998 234 567",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    note: 4.6,
    prixMoyen: "20-35 USD",
    description: "Cuisine africaine moderne avec une touche contemporaine, terrasse avec vue panoramique.",
    horaires: "12h00 - 23h00",
    specialites: ["Tilapia grillé", "Riz jollof", "Brochettes de bœuf", "Plantain caramélisé"],
    menu: [
      { id: '1', nom:"Tilapia grillé & frites", prix:"18 USD" },
      { id: '1', nom:"Brochettes de boeuf", prix:"15 USD" },
      { id: '1', nom:"Plantain caramélisé", prix:"8 USD" },
    ]
  },
  {
    id: "3",
    nom: "Saveurs du Katanga",
    logo: "https://images.unsplash.com/photo-1515165562835-c3b8e3b6a1b8?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1515165562835-c3b8e3b6a1b8?w=1200",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457b68?w=1200",
      "https://images.unsplash.com/photo-1589307000000-000000000000?w=1200"
    ],
    cuisine: "Locale Katangaise",
    adresse: "Avenue Lumumba, Centre-ville",
    telephone: "+243 999 345 678",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    note: 4.7,
    prixMoyen: "12-20 USD",
    description: "Spécialités du Katanga dans un cadre authentique avec musique traditionnelle.",
    horaires: "10h00 - 21h00",
    specialites: ["Chenilles grillées", "Kapenta", "Ugali", "Bière Primus"],
    menu: [
      { id: '1', nom:"Chenilles grillées", prix:"10 USD" },
      { id: '1', nom:"Kapenta & fufu", prix:"12 USD" },
      { id: '1', nom:"Ugali sauce tomate", prix:"8 USD" },
    ]
  },
  {
    id: "4",
    nom: "La Terrasse Tropicale",
    logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200",
      "https://images.unsplash.com/photo-1565299543927-d399139e797f?w=1200",
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=1200",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200"
    ],
    cuisine: "Internationale",
    adresse: "Quartier Résidentiel, Lubumbashi",
    telephone: "+243 997 456 789",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
    note: 4.5,
    prixMoyen: "25-40 USD",
    description: "Restaurant haut de gamme avec terrasse tropicale, cuisine internationale et africaine.",
    horaires: "18h00 - 24h00",
    specialites: ["Steaks", "Fruits de mer", "Salades exotiques", "Cocktails tropicaux"],
    menu: [
      { id: '1', nom:"Steak black Angus", prix:"28 USD" },
      { id: '1', nom:"Fruits de mer mix grill", prix:"32 USD" },
      { id: '1', nom:"Salade tropicale", prix:"16 USD" },
    ]
  },
  {
    id: "5",
    nom: "Mama Africa",
    logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200",
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1200",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200"
    ],
    cuisine: "Pan-Africaine",
    adresse: "Avenue des Martyrs, Lubumbashi",
    telephone: "+243 998 567 890",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
    note: 4.9,
    prixMoyen: "18-30 USD",
    description: "Voyage culinaire à travers l'Afrique avec des plats de différents pays du continent.",
    horaires: "11h30 - 22h30",
    specialites: ["Tagine marocain", "Injera éthiopien", "Bobotie sud-africain", "Thieboudienne"],
    menu: [
      { id: '1', nom:"Tagine marocain poulet", prix:"17 USD" },
      { id: '2', nom:"Bobotie sud-africain", prix:"15 USD" },
      { id: '3', nom:"Thieboudienne", prix:"14 USD" },
    ]
  },
  {
    id: "6",
    nom: "Le Palmier Royal",
    logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200",
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=1200",
      "https://images.unsplash.com/photo-1600891964703-9b56c37a4d27?w=1200",
      "https://images.unsplash.com/photo-1515165562835-c3b8e3b6a1b8?w=1200"
    ],
    cuisine: "Grillades & BBQ",
    adresse: "Route de Kipushi, Lubumbashi",
    telephone: "+243 999 678 901",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    note: 4.4,
    prixMoyen: "15-28 USD",
    description: "Spécialiste des grillades en plein air avec jardin tropical et animations musicales.",
    horaires: "16h00 - 23h00",
    specialites: ["Brochettes mixtes", "Porc grillé", "Poisson braisé", "Légumes grillés"],
    menu: [
      { id: '1', nom:"Brochettes mixtes BBQ", prix:"18 USD" },
      { id: '1', nom:"Porc grillé & frites", prix:"15 USD" },
      { id: '1', nom:"Poisson braisé", prix:"17 USD" },
    ]
  },
];