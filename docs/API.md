# Contrat API MenuCity

Toutes les réponses réussies utilisent `{ "data": ... }` et éventuellement `meta`. Les erreurs utilisent `{ "error": { "code", "message", "requestId", "fields?" } }`.

## Routes publiques

- `GET /health`
- `GET /v1/restaurants`
- `GET /v1/restaurants/:id`
- `GET /media/*` — `503 media_storage_unavailable` tant que R2 est désactivé

## Routes utilisateur

- `GET /v1/me`
- `PATCH /v1/me`
- `GET /v1/invitations`
- `POST /v1/invitations`
- `PUT /v1/uploads/:scope/:ownerId` — `503 media_storage_unavailable` tant que R2 est désactivé

## Routes administrateur

- CRUD `/v1/admin/restaurants`
- CRUD menus sous `/v1/admin/restaurants/:id/menu-items` et `/v1/admin/menu-items/:id`
- `GET /v1/admin/stats`
- gestion des références d’images externes ; l’upload de fichiers via `/v1/uploads/*` reste optionnel

Le JWT Clerk est vérifié par le Worker. Le rôle applicatif est ensuite chargé depuis `profiles` dans Neon ; les claims du client ne suffisent jamais à accorder l’administration.
