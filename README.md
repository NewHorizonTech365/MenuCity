# MenuCity

Application mobile/web Expo (React Native) pour explorer des restaurants a Lubumbashi, avec authentification Supabase et mode administrateur.

## Etat actuel

- Auth Supabase operationnelle (email/password) avec session persistante.
- Profil utilisateur synchronise avec `public.profiles`.
- Acces admin base sur `profiles.role` (user/admin) avec guards d'ecrans admin.
- Ecrans auth avances:
  - connexion
  - inscription
  - mot de passe oublie
  - email non confirme (renvoi email de confirmation)
- Carte activee dans l'app:
  - ecran map interactif
  - stabilisation anti-crash dans `RestaurantDetails` si coordonnees manquantes
- Donnees restaurants encore principalement locales (seed + AsyncStorage).

## Stack technique

- Expo SDK 54
- React 19 / React Native 0.81
- Expo Router
- TypeScript
- Supabase (`@supabase/supabase-js`)
- AsyncStorage

## Installation

### Prerequis

- Node.js 18+
- npm
