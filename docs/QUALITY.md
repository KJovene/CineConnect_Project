# Qualite et verification

## Tests

### Racine

```bash
pnpm test:front
pnpm test:back
```

### Watch mode

```bash
pnpm --filter frontend test:watch
pnpm --filter backend test:watch
```

## Lint et typecheck

```bash
pnpm lint:front
pnpm lint:back
pnpm typecheck:front
pnpm typecheck:back
```

## Detection de code mort

```bash
pnpm knip:front
pnpm knip:back
pnpm knip
```

## Verification complete locale

```bash
pnpm check:all
```

## Couverture

Les tests backend et frontend sont executes avec couverture via Jest.
Les rapports sont generes dans les dossiers `coverage/` de chaque package.

## Bon workflow avant PR

1. Lancer les tests du package modifie
2. Lancer lint + typecheck du package modifie
3. Lancer `pnpm check:all` avant push
