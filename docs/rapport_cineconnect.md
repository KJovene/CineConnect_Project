# RAPPORT DE PROJET — CinéConnect
**Web2 — HETIC | 2025-2026**  
Kevin, Hugo et Camille

---

## 1. Architecture technique

### 1.1 Vue d'ensemble — Monorepo

Le projet est organisé en monorepo géré via pnpm workspaces, avec la structure suivante :

- `/backend` — API REST Node.js/Express, WebSocket, accès base de données
- `/frontend` — Interface React, routing TanStack, composants UI
- `/shared` — Types TypeScript partagés entre front et back
- `/docs` — Documentation, schémas, README

Chaque package possède son propre Dockerfile et peut être lancé indépendamment ou via `docker-compose` depuis la racine du projet.

---

### 1.2 Backend — Node.js / Express

Le backend suit une architecture en couches clairement séparées :

- `routes/` — Définition des endpoints REST (films, categories, users, reviews, friends, messages)
- `controllers/` — Traitement des requêtes HTTP, validation des entrées
- `services/` — Logique métier (filmsService, reviewsService, friendsService, messagesService...)
- `repository/` — Accès à la base de données via Drizzle ORM
- `middlewares/` — Authentification JWT (authMiddleware)
- `db/` — Schéma Drizzle, migrations, seeds
- `config/` — Configuration Swagger
- `types/` — Types locaux au backend

La communication temps réel (chat) est assurée par Socket.io, intégré dans le fichier `socket.ts`. L'API est documentée via Swagger (OpenAPI).

---

### 1.3 Frontend — React / TanStack

Le frontend adopte l'**Atomic Design** pour structurer ses composants :

- `atoms/` — Composants de base (Button, Input, Badge, Avatar, RatingStars, Logo, ThemeToggle...)
- `molecules/` — Assemblages (SearchBar, ReviewCard, UserCard, AuthNavButton, ConversationList...)
- `organisms/` — Blocs fonctionnels (AppHeader, HeroSection, FilmCommunityReviews, ChatWindow, FriendList, MediaGrid, Sidebar...)
- `templates/` — Mises en page globales (AppLayout, AuthPageLayout)

Le routing est géré par **TanStack Router** avec des routes typées, organisées en routes authentifiées (`/_authenticated/...`) et publiques (login, signup). Les appels API sont encapsulés dans des hooks TanStack Query (`useSearchMovies`, `useMovieDetails`, `useTopRatedMovies`, `useReviews`, `useAuth`...) avec validation Zod des réponses.

---

### 1.4 Package shared

Le package `shared` contient les types TypeScript partagés entre le frontend et le backend : `Film`, `User`, `Review`, `Auth`, `Lists`, `Socket`, `Watchlist`. Cette approche garantit la cohérence des contrats de données et évite la duplication de définitions de types.

---

### 1.5 Base de données

La base de données PostgreSQL est modélisée et gérée via Drizzle ORM. Les tables principales sont : `users`, `films`, `categories`, `reviews`, `messages` et `friends`. Les migrations sont versionnées dans le dossier `drizzle/migrations`. Des scripts de seed permettent d'initialiser les données (`seedFilms`, `seedCategories`, `seedCommunity`).

---

### 1.6 Tests

Des tests unitaires et d'intégration couvrent les deux packages. Côté backend, les fichiers de test (Jest) couvrent les services (`filmsService`, `reviewsService`, `friendsService`...), les routes et les middlewares. Côté frontend, les hooks personnalisés sont testés (`useAuth`, `useSearchMovies`, `useMovieDetails`, `useLogin`...).

---

## 2. Répartition des rôles

L'équipe a adopté une approche **verticale** de gestion des fonctionnalités : chaque membre est responsable d'une fonctionnalité de bout en bout (frontend, backend, base de données, tests et responsive).

| Membre | Responsabilités |
|--------|----------------|
| **Kevin** | Initialisation du monorepo et configuration Docker |
| | Création du MCD et configuration Drizzle ORM |
| | Page profil et authentification (Better Auth) |
| | Commentaires et système de reviews |
| | Tests backend et frontend |
| | Documentation Swagger |
| | Nettoyage du code (knip, ESLint) |
| **Hugo** | Fonctionnalité de chat en temps réel (Socket.io) |
| | Gestion des amis (ajout, liste, suppression) |
| **Camille** | Intégration API OMDb (recherche et affichage des films) |
| | Module catégories et tests associés |
| | Validation des données avec Zod |
| | Mode sombre / clair (dark mode) |

---

## 3. Choix techniques

| Catégorie | Technologie | Rôle / Justification |
|-----------|-------------|----------------------|
| Monorepo | pnpm workspaces | Gestion unifiée des dépendances, partage de code entre packages |
| Frontend — Framework | React 18 + TypeScript | Composants fonctionnels, typage fort, écosystème riche |
| Frontend — Routing | TanStack Router | Routing typé, gestion des routes authentifiées, file-based routing |
| Frontend — Data fetching | TanStack Query | Cache, invalidation automatique, gestion des états de chargement |
| Frontend — Styles | TailwindCSS | Utilitaire-first, mode sombre natif, prototypage rapide |
| Frontend — UI | Atomic Design | Composants réutilisables et testables, architecture scalable |
| Validation | Zod | Validation runtime des données API, inférence de types TypeScript |
| Backend — Runtime | Node.js + Express | Légèreté, flexibilité, large écosystème |
| Backend — Auth | JWT / Better Auth | Sessions sécurisées sans état côté serveur |
| Backend — ORM | Drizzle ORM | Type-safe, migrations versionnées, compatible PostgreSQL |
| Base de données | PostgreSQL | Relationnel, robuste, support natif des JSON et transactions |
| Temps réel | Socket.io | WebSocket abstrait, fallback automatique, salles de chat |
| Documentation API | Swagger / OpenAPI | Documentation auto-générée, interface de test intégrée |
| Tests | Jest + Testing Library | Unitaires et d'intégration, couverture frontend et backend |
| Conteneurisation | Docker + docker-compose | Environnement reproductible, déploiement simplifié |
| Qualité du code | ESLint + knip | Linting strict, détection des exports/imports inutilisés |
| API Films externe | OMDb API | Base de données de films riche, utilisée en phase React initiale |
