# Variables d'environnement

## Fichiers utilises

- `.env` (racine): variables generales Docker/dev
- `backend/.env`: variables backend (obligatoire)
- `frontend/.env`: variables frontend Vite

## Initialisation rapide

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Puis creer `frontend/.env`.

## Backend (`backend/.env`)

Variables minimales:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/cineconnect
DRIZZLE_DATABASE_URL=postgres://postgres:password@127.0.0.1:5432/cineconnect
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
BETTER_AUTH_SECRET=<min-32-caracteres>
BETTER_AUTH_URL=http://localhost:3000
OMDB_API_KEY=<optionnel>
```

Notes:

- `DATABASE_URL`: utilisee par le backend et Drizzle runtime.
- `DRIZZLE_DATABASE_URL`: utile pour Drizzle execute depuis l'hote.
- `BETTER_AUTH_SECRET`: obligatoire en dehors du dev local.

## Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

- `VITE_API_URL`: base URL API REST.
- `VITE_SOCKET_URL`: base URL Socket.io.

## Securite

- Ne jamais commit les fichiers `.env`.
- Partir des `.env.example`.
- Regenerer les secrets pour tout environnement non local.
