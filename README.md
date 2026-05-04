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

### Configuration env

Creer un fichier `.env` a la racine:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Important:
- pas de guillemets
- pas de `;`

### Commandes

```bash
npm install
npm run dev
```

Autres scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
npx tsc --noEmit
```

## Durcissement SQL (obligatoire)

Executer le script suivant dans Supabase SQL Editor:

- `supabase/auth_hardening.sql`

Ce script applique:
- schema `profiles` robuste
- trigger idempotent auto-create profile
- RLS stricte (select/insert/update)
- prevention d'elevation de role par utilisateur standard

## Documentation projet

- Rapport complet (historique + actions restantes):
  - `docs/menu-city-project-report.md`
- Version HTML imprimable:
  - `docs/menu-city-project-report.html`
- Checklist de test auth:
  - `docs/auth-test-checklist.md`

## Prochaines priorites

1. Migrer les CRUD restaurants/menu vers Supabase (cloud) + RLS.
2. Activer Google Sign-In complet (OAuth Supabase mobile).
3. Mettre en place tests E2E des flux critiques auth/admin.
4. Finaliser observabilite (erreurs auth + incidents reseau).
