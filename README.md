# MenuCity

Application mobile/web Expo (React Native) pour explorer des restaurants a Lubumbashi, avec authentification Supabase et un panel administrateur.

## 1) Objectif du projet

MenuCity permet de:
- consulter des restaurants et leurs menus,
- gerer son profil utilisateur,
- se connecter / s'inscrire avec Supabase,
- acceder a un dashboard admin (si role `admin`).

Le projet est encore en evolution: une partie des donnees restaurants est actuellement stockee en local (AsyncStorage), et la migration cloud est prevue.

## 2) Stack technique

- Expo SDK 54
- React 19 + React Native 0.81
- Expo Router (routing)
- TypeScript
- Supabase (`@supabase/supabase-js`) pour auth/profils
- AsyncStorage pour persistance locale des donnees restaurants
- Reanimated / Expo Blur / Expo Image Picker pour l'UI

## 3) Fonctionnalites principales

### Cote utilisateur
- Ecran d'accueil et navigation (home, restaurants, profile)
- Inscription / connexion email + mot de passe
- Persistance de session Supabase (reconnexion sans se reinscrire)
- Edition du profil (nom, telephone, bio, photo profil, photo couverture)

### Cote admin
- Acces admin selon le role `admin`
- Dashboard admin
- Gestion CRUD des restaurants
- Gestion CRUD des plats/menu
- Ecran de statistiques admin

## 4) Structure du projet

```txt
MenuCity/
  app/
    auth/                 # login/register
    admin/                # dashboard + gestion restaurants + stats
    home.tsx
    profile.tsx
    restaurants.tsx
  components/             # UI components
  hooks/
    useAuth.ts            # logique auth/session/profil
  providers/
    AuthProvider.tsx
    DataProvider.tsx      # donnees restaurants (local storage)
  lib/
    supabase.ts           # client Supabase
    storage.ts            # helpers AsyncStorage
  types/                  # types TS (User, Restaurant...)
  data/                   # seed local restaurants
```

## 5) Installation et lancement

### Prerequis
- Node.js 18+
- npm
- Expo Go (mobile) ou emulateur Android/iOS

### Commandes

```bash
npm install
npm run dev
```

Configuration environnement:

```bash
cp .env.example .env
```

Puis renseigner:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Autres scripts utiles:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## 6) Authentification Supabase

Le client Supabase est configure dans `lib/supabase.ts` avec:
- `persistSession: true`
- `autoRefreshToken: true`
- stockage session sur AsyncStorage

Flux global:
1. `register(...)` cree le compte Supabase.
2. Un profil `public.profiles` est cree/maintenu.
3. `login(...)` ouvre une session persistante.
4. Au redemarrage de l'app, la session est restauree automatiquement.

## 7) Table profiles (resume attendu)

Le projet s'appuie sur une table `public.profiles` reliee a `auth.users`.
Champs utilises couramment:
- `id` (uuid, PK, reference `auth.users.id`)
- `email`
- `role` (`user` | `admin`)
- `created_at`

Des colonnes supplementaires peuvent etre ajoutees cote SQL si tu veux stocker davantage directement dans `profiles` (ex: `nom`, `telephone`, `bio`, etc.).

## 8) Mode admin

Un utilisateur peut acceder au panel admin si:
- son `role` dans `profiles` vaut `admin`,
- et les guards de routes valident ce role.

Actuellement:
- acces admin depuis `profile.tsx` si `user.role === "admin"`,
- protections en place dans les ecrans `app/admin/*`.

## 9) Etat actuel des donnees

- Auth/profil: Supabase
- Restaurants/menu: principalement local (AsyncStorage + seed)

Donc:
- les comptes utilisateur sont persistants via Supabase,
- les donnees restaurants sont locales tant que la migration cloud complete n'est pas terminee.

## 10) Ameliorations recommandees

- Deplacer `SUPABASE_URL` et `SUPABASE_ANON_KEY` vers des variables d'environnement.
- Finaliser la migration CRUD restaurants vers Supabase (RLS + policies).
- Ajouter des tests E2E sur les flux critiques (auth + routes admin).
- Corriger les textes accentues qui presentent parfois un encodage incorrect.

## 11) Auteur

Projet: **MenuCity**  
Contexte: application de decouverte/restauration pour Lubumbashi.
