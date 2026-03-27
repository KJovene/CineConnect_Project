# API Backend

## Base URL locale

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`
- Swagger JSON: `http://localhost:3000/api/docs.json`

## Healthcheck

- `GET /` -> verification que l'API tourne.

## Auth (Better Auth)

Routes montees sous:

- `/api/auth`

Exemples utilises par le frontend:

- `POST /api/auth/update-user`
- `POST /api/auth/change-password`
- `POST /api/auth/delete-user`

La session transite via cookies (`better-auth.session_token`).

## Domaines REST principaux

### Categories

- `GET /api/categories`
- `GET /api/categories/films`
- `GET /api/categories/:id/films`

### Films

- `GET /api/films/search`
- `GET /api/films/by-genre`
- `GET /api/films/top-rated`
- `GET /api/films/community-reviews`
- `GET /api/films/:omdbId`

### Reviews

- `GET /api/reviews`
- `GET /api/reviews/rating-summary`
- `POST /api/reviews/rating`
- `POST /api/reviews`
- `POST /api/reviews/:reviewId/replies`
- `PATCH /api/reviews/:reviewId`
- `DELETE /api/reviews/:reviewId`

### Friends

- `GET /api/friends`
- `GET /api/friends/pending`
- `POST /api/friends/request`
- `POST /api/friends/accept`
- `POST /api/friends/reject`
- `DELETE /api/friends/:friendUserId`

### Messages

- `GET /api/messages/with/:userId`
- `GET /api/messages/conversations`
- `GET /api/messages/incoming`
- `POST /api/messages`

### Users

- `GET /api/users/me/latest-ratings`
- `GET /api/users/me/latest-comments`
- `GET /api/users/me/comment-replies`
- `GET /api/users`

## Conseils d'usage

- Preferer Swagger pour verifier schemas et payloads exacts.
- Pour les routes protegees, etre connecte avant appel.
- Conserver `credentials: include` cote frontend.
