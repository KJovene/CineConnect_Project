import { Router } from "express";
import {
  attachSession,
} from "../middlewares/authMiddleware.js";
import {
  getByGenre,
  getByOmdbId,
  getCommunityReviews,
  getTopRated,
  search,
} from "../controllers/filmsController.js";
import reviewsRouter from "./reviews.js";

const router = Router();

// ─── GET /api/films/search?q=inception&page=1 ─────────────────────────────────
// Recherche de films. Flow : BDD → OMDB → sauvegarde → résultats.

router.get("/search", search);

// ─── GET /api/films/by-genre?limit=24 ─────────────────────────────────────────
// Films groupés par genre → pour la page Films (carousel par catégorie).

router.get("/by-genre", getByGenre);

// ─── GET /api/films/top-rated?limit=10 ───────────────────────────────────────
// Films les mieux notés en BDD → pour la homepage.

router.get("/top-rated", getTopRated);

router.get("/community-reviews", getCommunityReviews);

router.use("/:omdbId/reviews", reviewsRouter);

// ─── GET /api/films/:omdbId ───────────────────────────────────────────────────
// Détail d'un film par son imdbID (ex: "tt1375666").
// ⚠️  Cette route doit être APRÈS /search et /top-rated pour ne pas les intercepter.

router.get("/:omdbId", attachSession, getByOmdbId);

export default router;
