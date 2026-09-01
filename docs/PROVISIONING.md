# Provisionnement Clerk, Neon, Cloudflare et EAS

Ce guide termine les opérations qui exigent les comptes propriétaires. Il ne faut activer aucune offre payante ni ajouter de moyen de paiement sans décision explicite.

## 1. Clerk

1. Créer une application `MenuCity` en environnement de développement.
2. Activer e-mail + mot de passe, vérification e-mail par code, réinitialisation par code et Google.
3. Ajouter `menucity://auth/sso-callback` aux URL de redirection natives autorisées.
4. Copier seulement la publishable key dans Expo sous `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
5. Copier la clé publique JWT/PEM dans le secret Worker `CLERK_JWT_KEY`.
6. Ne jamais placer de secret OAuth Google dans `EXPO_PUBLIC_*`. Faire tourner l’ancien secret Google qui était présent dans la configuration locale.

Le plan Hobby Clerk annonce actuellement 50 000 MRU par application, sans carte bancaire. Vérifier la [page de tarification Clerk](https://clerk.com/pricing) avant toute mise en production.

## 2. Neon

Le projet `MenuCity` existe déjà avec `main` et `development`. Les migrations et le seed ont été appliqués uniquement à `development`.

Créer un rôle de connexion Worker distinct et l’associer au groupe limité préparé par la migration :

```sql
CREATE ROLE menucity_worker LOGIN PASSWORD '<mot-de-passe-long-généré>' IN ROLE menucity_runtime;
```

Utiliser sa connexion poolée dans `DATABASE_URL`. La connexion propriétaire non poolée reste réservée à `DIRECT_DATABASE_URL` pour les migrations. Le plan Free actuel annonce notamment 0,5 Go de stockage et 100 CU-heures mensuelles par projet ; vérifier la [tarification Neon](https://neon.com/pricing) car les quotas peuvent changer.

Promotion du premier administrateur, après sa première connexion Clerk :

```sql
UPDATE profiles SET role = 'admin', updated_at = now() WHERE user_id = '<clerk_user_id>';
```

## 3. Cloudflare Worker

```bash
cd api
npx wrangler login
npx wrangler secret put DATABASE_URL --env development
npx wrangler secret put CLERK_JWT_KEY --env development
npm run deploy:development
```

Après validation Android, répéter les secrets avec `--env production`, mettre l’origine web réelle dans `wrangler.jsonc`, puis seulement lancer `npm run deploy:production`.

Au 30 août 2026, Workers Free est limité à 100 000 requêtes/jour, 10 ms de CPU et 128 Mo de mémoire. Référence à surveiller : [limites Workers](https://developers.cloudflare.com/workers/platform/limits/).

Contrôles hebdomadaires recommandés : requêtes Worker, erreurs `1027` et CPU.

### R2 reporté

R2 n’est pas requis pour déployer l’API. Sans binding `MEDIA`, `GET /media/*` et `PUT /v1/uploads/*` répondent `503 media_storage_unavailable`. Le catalogue continue d’utiliser ses URLs externes. Ne réintroduire les bindings R2 et `EXPO_PUBLIC_MEDIA_UPLOADS_ENABLED=true` qu’après une décision explicite d’activer la souscription à facturation selon l’usage.

## 4. EAS Android preview

Ajouter dans EAS uniquement les deux valeurs publiques Expo :

```bash
npx eas-cli env:create preview --name EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY --value pk_test_... --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_API_URL --value https://<worker-dev> --visibility plaintext
npx eas-cli env:create preview --name EXPO_PUBLIC_MEDIA_UPLOADS_ENABLED --value false --visibility plaintext
npx eas-cli build --platform android --profile preview
```

Le profil `preview` produit un APK. Valider inscription, OTP, renvoi, connexion, Google, mot de passe oublié, déconnexion, catalogue public, hors ligne, invitations et administration avant toute production.
