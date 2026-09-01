# MenuCity

MenuCity est une application Expo de découverte de restaurants à Lubumbashi. Le catalogue est public ; le profil, les invitations et l’administration nécessitent une session Clerk.

## Architecture

```text
Expo Android / Web
        │ Clerk JWT
        ▼
Cloudflare Worker (Hono)
        └── Neon PostgreSQL (Drizzle)
```

Le mobile ne reçoit jamais de connexion PostgreSQL, de clé Clerk privée ou de secret R2. AsyncStorage contient uniquement le dernier catalogue public disponible hors ligne.

## État de la migration

- Branche Git : `codex/neon-migration`.
- Projet Neon : `MenuCity`, branches `main` et `development`.
- `development` contient 6 restaurants, 18 plats, 24 photos de restaurants et 18 photos de plats avec UUID déterministes.
- Les migrations ont été validées sur une branche Neon vierge temporaire.
- L’API Worker, Clerk Expo, OTP, Google SSO, cache public et rôles sont implémentés localement.
- R2 reste optionnel et désactivé : les images externes existantes sont conservées et les uploads de fichiers sont indisponibles.
- Le provisionnement Clerk/Cloudflare et le build EAS final demandent les comptes propriétaires ; voir [le guide de provisionnement](docs/PROVISIONING.md).

## Installation locale

Prérequis : Node.js 20+, npm et un compte Expo. Pour compiler localement Android, il faut aussi un JDK configuré dans `JAVA_HOME` et le SDK Android ; sinon utiliser EAS Build.

```bash
npm ci --legacy-peer-deps
npm --prefix api ci
```

Copier `.env.example` vers `.env`, puis renseigner seulement :

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=http://localhost:8787
EXPO_PUBLIC_MEDIA_UPLOADS_ENABLED=false
```

Copier `api/.dev.vars.example` vers `api/.dev.vars`. `DATABASE_URL` doit utiliser un rôle d’exécution limité appartenant à `menucity_runtime`. Ne jamais y placer la connexion propriétaire.

```bash
npm run api:dev
npm run android
```

Pendant le développement JS, `npx expo start` ou `npm run dev` lance MenuCity dans Expo Go sur le réseau local ; `npm run dev:tunnel` fournit le même mode via un tunnel. Les parcours personnalisés e-mail, mot de passe et OTP fonctionnent dans Expo Go. Google/Apple natifs et les composants natifs Clerk nécessiteront plus tard de réinstaller `expo-dev-client` et de générer un development build.

## Commandes utiles

```bash
npm run typecheck
npm run lint
npm run api:typecheck
npm run api:test
npm run build:web
npx expo-doctor
```

Les migrations Drizzle utilisent exclusivement `DIRECT_DATABASE_URL`, chargée depuis un environnement séparé basé sur `api/.env.migrations.example`.

## Sécurité et coûts

- Le rôle `user` est attribué par défaut dans Neon et ne peut pas être modifié par le client.
- Un restaurant supprimé depuis l’administration est archivé.
- Quand un stockage R2 sera explicitement activé, les uploads accepteront uniquement JPEG, PNG ou WebP valides, jusqu’à 5 Mo.
- Aucun basculement automatique vers une offre payante n’est configuré.
- Les limites gratuites et la procédure de surveillance sont documentées dans [docs/PROVISIONING.md](docs/PROVISIONING.md).

## Licence

Ce dépôt est propriétaire. Voir [LICENCE](LICENCE).
