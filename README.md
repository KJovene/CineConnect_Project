# CineConnect

Monorepo TypeScript pour une application cinema communautaire:

- Frontend: React + Vite + TanStack Router + React Query
- Backend: Express + Better Auth + Drizzle ORM + Socket.io
- Shared: package de types/utilitaires partages

## Prerequis

- Node.js 20+
- pnpm 10+
- PostgreSQL 15+ (local) ou Docker

Commandes conseillees:

```bash
node -v
corepack enable
pnpm -v
```

## Demarrage depuis zero (mode local)

### 1. Cloner et installer

```bash
git clone <url-du-repo>
cd CineConnect_Project
pnpm install
```

### 2. Creer les fichiers d'environnement

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Creer aussi `frontend/.env` avec:

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Dans `backend/.env`, renseigner au minimum:

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/cineconnect
DRIZZLE_DATABASE_URL=postgres://postgres:password@127.0.0.1:5432/cineconnect
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
BETTER_AUTH_SECRET=<cle-secrete-min-32-caracteres>
BETTER_AUTH_URL=http://localhost:3000
OMDB_API_KEY=<optionnel-mais-recommande>
```

Pour generer une cle Better Auth:

```bash
openssl rand -base64 32
```

### 3. Creer la base PostgreSQL

Créer une base nommee `cineconnect` dans PostgreSQL.

Exemple (si PostgreSQL local):

```bash
createdb -U postgres cineconnect
```

### 4. Construire le package shared

Le backend consomme `@cineconnect/shared` depuis `shared/dist`.

```bash
pnpm build:shared
```

### 5. Appliquer le schema/migrations

Option recommandee (migrations versionnees):

```bash
pnpm db:migrate
```

Option alternative (push schema direct):

```bash
pnpm --filter backend db:push
```

### 6. (Optionnel) Seeder la base

```bash
pnpm --filter backend db:seed
```

Note: le seed complet peut utiliser OMDB, donc `OMDB_API_KEY` doit etre defini.

### 7. Lancer l'application

```bash
pnpm dev
```

Acces local:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger UI: http://localhost:3000/api/docs

## Demarrage depuis zero (mode Docker)

### 1. Preparer l'environnement

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Creer `frontend/.env` (meme contenu que ci-dessus).

### 2. Lancer les services

```bash
docker compose up --build
```

ou via Makefile:

```bash
make up
```

### 3. Appliquer les migrations

```bash
make db-migrate
```

### 4. Acces local

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433

## Scripts utiles

### Racine

- `pnpm dev`: lance backend + frontend
- `pnpm build:shared`: build package shared
- `pnpm test:front`: tests frontend
- `pnpm test:back`: tests backend
- `pnpm check:all`: lint + typecheck + knip
- `pnpm db:generate`: genere migrations Drizzle
- `pnpm db:migrate`: applique migrations

### Backend

- `pnpm --filter backend dev`
- `pnpm --filter backend db:push`
- `pnpm --filter backend db:studio`
- `pnpm --filter backend db:seed`

## Documentation

La documentation detaillee se trouve dans `docs/`:

- `docs/README.md`: index de la documentation
- `docs/ARCHITECTURE.md`: architecture monorepo et flux
- `docs/ENVIRONMENT.md`: variables d'environnement
- `docs/API.md`: endpoints, auth et Swagger
- `docs/DATABASE.md`: schema, migrations, seeds
- `docs/REALTIME.md`: Socket.io et messagerie
- `docs/QUALITY.md`: tests, lint, typecheck
- `docs/DOCKER.md`: details Docker
