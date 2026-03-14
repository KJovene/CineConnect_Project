import { Router, Request, Response } from "express";
import {
  searchFilms,
  getFilmDetail,
  getTopRatedFilms,
  getFilmsByGenre,
} from "../services/filmsService.js";
import {
  attachSession,
  type RequestWithSession,
} from "../middlewares/authMiddleware.js";
import { getFilmRatingSummary } from "../services/reviewsService.js";
import reviewsRouter from "./reviews.js";

const router = Router();

// ─── GET /api/films/search?q=inception&page=1 ─────────────────────────────────
// Recherche de films. Flow : BDD → OMDB → sauvegarde → résultats.

router.get("/search", async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string) || 1;

  if (!query || query.trim().length < 3) {
    res.status(400).json({
      error: "Bad Request",
      message: "Le paramètre 'q' doit faire au moins 3 caractères",
    });
    return;
  }

  try {
    const data = await searchFilms(query.trim(), page);
    res.json(data);
  } catch (err) {
    console.error("[films/search]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la recherche",
    });
  }
});

// ─── GET /api/films/by-genre?limit=24 ─────────────────────────────────────────
// Films groupés par genre → pour la page Films (carousel par catégorie).

router.get("/by-genre", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 24;

  try {
    const data = await getFilmsByGenre(limit);
    res.json(data);
  } catch (err) {
    console.error("[films/by-genre]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des films par genre",
    });
  }
});

// ─── GET /api/films/top-rated?limit=10 ───────────────────────────────────────
// Films les mieux notés en BDD → pour la homepage.

router.get("/top-rated", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const data = await getTopRatedFilms(limit);
    res.json(data);
  } catch (err) {
    console.error("[films/top-rated]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des films",
    });
  }
});

router.use("/:omdbId/reviews", reviewsRouter);

// ─── GET /api/films/:omdbId ───────────────────────────────────────────────────
// Détail d'un film par son imdbID (ex: "tt1375666").
// ⚠️  Cette route doit être APRÈS /search et /top-rated pour ne pas les intercepter.

router.get(
  "/:omdbId",
  attachSession,
  async (req: RequestWithSession, res: Response) => {
    const omdbId = Array.isArray(req.params.omdbId)
      ? req.params.omdbId[0]
      : req.params.omdbId;

    const sessionUserId = req.session?.user?.id;
    const userId =
      typeof sessionUserId === "string"
        ? Number.parseInt(sessionUserId, 10)
        : undefined;

    try {
      const film = await getFilmDetail(omdbId);
      if (!film) {
        res
          .status(404)
          .json({
            error: "Not Found",
            message: `Film "${omdbId}" introuvable`,
          });
        return;
      }

      const ratingSummary = await getFilmRatingSummary({
        omdbId,
        userId: Number.isNaN(userId) ? undefined : userId,
      });

      res.json({
        ...film,
        average_rating: ratingSummary.averageRating,
        ratings_count: ratingSummary.totalRatings,
        user_rating: ratingSummary.userRating,
      });
    } catch (err) {
      console.error("[films/:omdbId]", err);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Erreur lors de la récupération du film",
      });
    }
  },
);

export default router;
