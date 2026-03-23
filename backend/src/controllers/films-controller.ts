import type { Request, Response } from "express";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import {
  searchFilms,
  getFilmDetail,
  getTopRatedFilms,
  getFilmsByGenre,
} from "../services/filmsService.js";
import {
  getFilmRatingSummary,
  getLatestCommunityReviews,
} from "../services/reviewsService.js";

export async function search(req: Request, res: Response) {
  const query = req.query.q as string;
  const page = parseInt(req.query.page as string, 10) || 1;

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
}

export async function getByGenre(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string, 10) || 24;

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
}

export async function getTopRated(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string, 10) || 10;

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
}

export async function getCommunityReviews(req: Request, res: Response) {
  const limit = Number.parseInt(req.query.limit as string, 10) || 4;

  try {
    const data = await getLatestCommunityReviews(limit);
    res.json(data);
  } catch (err) {
    console.error("[films/community-reviews]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des avis de la communauté",
    });
  }
}

export async function getByOmdbId(req: RequestWithSession, res: Response) {
  const omdbId = String(req.params.omdbId);
  const userId = Number.parseInt(String(req.session?.user?.id), 10);

  try {
    const film = await getFilmDetail(omdbId);
    if (!film) {
      res.status(404).json({
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
}
