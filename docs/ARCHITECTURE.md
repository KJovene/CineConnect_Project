# Architecture

## Vue d'ensemble

CineConnect est un monorepo pnpm compose de 3 packages:

- `frontend/`: application React (Vite, TanStack Router, React Query)
- `backend/`: API Express (Better Auth, Drizzle, Socket.io)
- `shared/`: types et utilitaires partages

## Structure principale

```text
backend/src/
  routes/         -> definition des routes
  controllers/    -> gestion HTTP (req/res)
  services/       -> logique metier
  repository/     -> acces donnees
  db/             -> schema et scripts seed
  middlewares/    -> auth/session
  config/         -> swagger
  socket.ts       -> temps reel

frontend/src/
  routes/         -> pages TanStack Router
  hooks/          -> logique de donnees et etat
  components/     -> UI reutilisable
  lib/            -> clients API/auth/socket

shared/src/
  types/          -> types partages
  index.ts        -> exports communs
```

## Flux backend

```text
HTTP Request -> Route -> Controller -> Service -> Repository/DB
```

- Les routes declarent les endpoints.
- Les controllers valident l'entree et construisent la reponse HTTP.
- Les services contiennent la logique metier.
- Les repositories isolent les acces a PostgreSQL/Drizzle.

## Flux frontend

```text
Route/Page -> Hook -> lib/apiClient -> Backend API
```

- Les routes pilotent la navigation.
- Les hooks centralisent fetch/cache (React Query) et validation (Zod).
- Les composants restent presentationnels quand possible.

## Authentification

- Better Auth est monte sous `/api/auth`.
- Le backend attache la session via `attachSession`.
- Les routes protegees utilisent `requireAuth`.
- Le frontend envoie les cookies de session (`credentials: include`).

## Temps reel

- Socket.io est initialise cote backend sur le meme serveur HTTP.
- Cote frontend, la connexion socket reutilise les cookies de session.
- Les rooms `user:<id>` permettent les DM cibles.
