# Base de donnees

## Technologie

- PostgreSQL
- Drizzle ORM
- Migrations SQL dans `backend/drizzle/migrations`

## Connexions

Variables utilisees:

- `DATABASE_URL`
- `DRIZZLE_DATABASE_URL` (optionnelle mais pratique en local)

## Commandes principales

Depuis la racine:

```bash
pnpm db:generate
pnpm db:migrate
```

Depuis le backend:

```bash
pnpm --filter backend db:push
pnpm --filter backend db:studio
pnpm --filter backend db:drop
```

## Strategie recommandee

1. Modifier le schema
2. Generer migration (`pnpm db:generate`)
3. Appliquer migration (`pnpm db:migrate`)
4. Commiter la migration generee

## Seed

Scripts disponibles:

- `pnpm --filter backend db:seed`
- `pnpm --filter backend db:seed-users`
- `pnpm --filter backend db:seed-films`
- `pnpm --filter backend db:seed-community`
- `pnpm --filter backend db:seed-categories`

Attention:

- Le seed complet peut dependre de `OMDB_API_KEY`.
- Sur environnement de test, preferer des seeds cibles et repetables.

## Tables metier principales

- `users`
- `films`
- `categories`
- `films_categories`
- `reviews`
- `friends`
- `messages`
- tables Better Auth (`session`, `account`, `verification`, ...)
