# RAPPORT DE PROJET — CinéConnect
**Web2 — HETIC | 2025-2026**  
Kevin, Hugo et Camille

---

## 1. Architecture technique

### 1.1 Vue d'ensemble — Monorepo

Le projet est organisé en monorepo géré via **pnpm workspaces (pnpm 10)**, avec la structure suivante :

- `/backend` — API REST Node.js/Express 5, WebSocket, accès base de données
- `/frontend` — Interface React 19, routing TanStack, composants UI
- `/shared` — Types et schémas Zod partagés entre front et back
- `/docs` — Documentation, schémas, README

Chaque package possède son propre Dockerfile et peut être lancé indépendamment ou via `docker-compose` depuis la racine du projet.

---

### 1.2 Backend — Node.js / Express 5

Le backend suit une architecture en couches clairement séparées :

- `routes/` — Définition des endpoints REST (films, categories, users, reviews, friends, messages)
- `controllers/` — Traitement des requêtes HTTP, validation des entrées
- `services/` — Logique métier (filmsService, reviewsService, friendsService, messagesService...)
- `repository/` — Accès à la base de données via Drizzle ORM
- `middlewares/` — Middleware de session Better Auth (`authMiddleware`)
- `db/` — Schéma Drizzle, migrations, seeds
- `config/` — Configuration Swagger et Better Auth
- `sockets/` — Logique Socket.io (`socket.ts`)
- `types/` — Types locaux au backend

La communication temps réel (chat, présence, reviews) est assurée par **Socket.io 4.8**, intégré sur le même serveur HTTP que l'API REST. L'API est documentée via Swagger (OpenAPI).

---

### 1.3 Frontend — React 19 / TanStack

Le frontend adopte l'**Atomic Design** pour structurer ses composants :

- `atoms/` — Composants de base (Button, Input, Badge, Avatar, RatingStars, Logo, ThemeToggle, ErrorAlert...)
- `molecules/` — Assemblages (SearchBar, MovieCard, ReviewCard, UserCard, ConversationList, ProfileNameEditor, SearchUserRow...)
- `organisms/` — Blocs fonctionnels (AppHeader, Sidebar, HeroSection, FilmCommunityReviews, ChatWindow, FriendList, MediaGrid, CategoryCarousel, ReviewList, FilmDetailHeader...)
- `templates/` — Mises en page globales (AppLayout, AuthPageLayout)

Le routing est géré par **TanStack Router** en mode file-based, avec des routes authentifiées (`/_authenticated/...`) et publiques (login, signup). Les routes disponibles sont :

| Route | Page |
|-------|------|
| `/` | Découverte (home) |
| `/login` | Connexion |
| `/signup` | Inscription |
| `/profil` | Profil utilisateur |
| `/search` | Recherche d'utilisateurs |
| `/discussion` | Messagerie directe |
| `/film` | Liste des films |
| `/film/:id` | Détail film + reviews |
| `/film/category/:categoryId` | Films par catégorie |

Les appels API sont encapsulés dans des hooks TanStack Query avec validation Zod des réponses.

---

### 1.4 Package shared

Le package `shared` contient les **schémas Zod** partagés entre le frontend et le backend, dont les types TypeScript sont inférés via `z.infer<>`. Les modules couverts sont : `auth`, `users`, `films`, `reviews`, `socket`, `lists`, `watchlist`, `api` (wrappers `ApiResponse<T>`, `PaginatedResponse<T>`). Cette approche garantit la cohérence des contrats de données et la validation runtime des deux côtés.

---

### 1.5 Base de données

La base de données PostgreSQL est modélisée et gérée via Drizzle ORM. Les tables métier principales sont : `users`, `films`, `categories`, `films_categories` (liaison M:N), `reviews`, `messages` et `friends`. Les tables Better Auth (`session`, `account`, `verification`) sont également gérées par Drizzle. Les migrations sont versionnées dans `drizzle/migrations`. Des scripts de seed permettent d'initialiser les données (`seedFilms`, `seedCategories`, `seedCommunity`).

Le système de reviews supporte les **commentaires imbriqués** via `parent_review_id` (réponses à une review).

---

### 1.6 Tests

Des tests unitaires et d'intégration couvrent les deux packages. Côté backend, les fichiers de test (Jest) couvrent les services (`filmsService`, `reviewsService`, `friendsService`...), les routes et les middlewares. Côté frontend, les hooks personnalisés sont testés (`useAuth`, `useSearchMovies`, `useMovieDetails`, `useLogin`...). Les dossiers de test sont exclus du build TypeScript de production (`tsconfig.json` → `exclude: ["src/__tests__"]`).

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
| | Présence en ligne / hors ligne (presence:online/offline) |
| **Camille** | Intégration API OMDb (recherche et affichage des films) |
| | Module catégories et tests associés |
| | Validation des données avec Zod |
| | Mode sombre / clair (dark mode) |

---

## 3. Choix techniques

| Catégorie | Technologie | Rôle / Justification |
|-----------|-------------|----------------------|
| Monorepo | pnpm workspaces (v10) | Gestion unifiée des dépendances, partage de code entre packages |
| Frontend — Framework | React 19 + TypeScript | Composants fonctionnels, typage fort, écosystème riche |
| Frontend — Routing | TanStack Router (file-based) | Routing typé, routes authentifiées, code-splitting automatique |
| Frontend — Data fetching | TanStack Query v5 | Cache, invalidation automatique, gestion des états de chargement |
| Frontend — Styles | Tailwind CSS v4 (plugin Vite) | Utilitaire-first, mode sombre natif, configuration via CSS |
| Frontend — UI | Atomic Design | Composants réutilisables et testables, architecture scalable |
| Validation | Zod v4 | Validation runtime partagée front/back, inférence de types TypeScript |
| Backend — Runtime | Node.js + Express 5 | Légèreté, flexibilité, gestion native des promesses en v5 |
| Backend — Auth | Better Auth (cookies de session) | Authentification email/password, sessions persistées en base via Drizzle |
| Backend — ORM | Drizzle ORM | Type-safe, migrations versionnées, compatible PostgreSQL |
| Base de données | PostgreSQL 15 | Relationnel, robuste, support natif des JSON et transactions |
| Temps réel | Socket.io 4.8 | WebSocket abstrait, présence utilisateur, mise à jour live des reviews |
| Documentation API | Swagger / OpenAPI | Documentation auto-générée, interface de test intégrée |
| Tests | Jest + Testing Library | Unitaires et d'intégration, couverture frontend et backend |
| Conteneurisation | Docker + docker-compose | Environnement reproductible, déploiement simplifié |
| Qualité du code | ESLint + knip | Linting strict, détection des exports/imports inutilisés |
| API Films externe | OMDb API | Recherche et métadonnées films (titre, affiche, genre, note...)
