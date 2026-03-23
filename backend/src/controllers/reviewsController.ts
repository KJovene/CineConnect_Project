import type { Response } from "express";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import {
  createFilmComment,
  createReviewReply,
  deleteReviewComment,
  FilmNotFoundError,
  ForbiddenReviewActionError,
  getFilmComments,
  getFilmRatingSummary,
  ReplyDepthExceededError,
  ReviewNotFoundError,
  upsertFilmRating,
  updateReviewComment,
} from "../services/reviewsService.js";

function getOmdbId(req: RequestWithSession): string {
  return String(req.params.omdbId ?? "").trim();
}

function getNumberParam(value: string | string[] | undefined): number {
  return Number.parseInt(String(value ?? ""), 10);
}

export async function getComments(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  if (!omdbId) {
    res.status(400).json({ error: "omdbId manquant" });
    return;
  }

  try {
    const comments = await getFilmComments(omdbId);
    res.json(comments);
  } catch (error) {
    if (error instanceof FilmNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getRatingSummary(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  if (!omdbId) {
    res.status(400).json({ error: "omdbId manquant" });
    return;
  }

  const sessionUserId = req.session?.user?.id;
  const userId = Number.parseInt(String(sessionUserId ?? ""), 10);

  try {
    const summary = await getFilmRatingSummary({
      omdbId,
      userId: Number.isNaN(userId) ? undefined : userId,
    });
    res.json(summary);
  } catch (error) {
    if (error instanceof FilmNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function setRating(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  if (!omdbId) {
    res.status(400).json({ error: "omdbId manquant" });
    return;
  }

  const userId = Number.parseInt(req.session!.user.id, 10);
  const { rating } = req.body as { rating?: number };

  if (typeof rating !== "number") {
    res.status(400).json({ error: "Le champ rating est requis" });
    return;
  }

  try {
    await upsertFilmRating({ omdbId, userId, rating });
    const summary = await getFilmRatingSummary({ omdbId, userId });
    res.json(summary);
  } catch (error) {
    if (error instanceof FilmNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createComment(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  if (!omdbId) {
    res.status(400).json({ error: "omdbId manquant" });
    return;
  }

  const userId = parseInt(req.session!.user.id, 10);
  const { comment, rating } = req.body as {
    comment?: string;
    rating?: number;
  };

  if (typeof comment !== "string") {
    res.status(400).json({ error: "Le champ comment est requis" });
    return;
  }

  try {
    const created = await createFilmComment({
      omdbId,
      userId,
      comment,
      rating,
    });
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof FilmNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createReply(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  const reviewId = getNumberParam(req.params.reviewId);

  if (!omdbId || Number.isNaN(reviewId)) {
    res.status(400).json({ error: "Paramètres invalides" });
    return;
  }

  const userId = parseInt(req.session!.user.id, 10);
  const { comment } = req.body as { comment?: string };

  if (typeof comment !== "string") {
    res.status(400).json({ error: "Le champ comment est requis" });
    return;
  }

  try {
    const created = await createReviewReply({
      omdbId,
      userId,
      parentReviewId: reviewId,
      comment,
    });
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof FilmNotFoundError || error instanceof ReviewNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ReplyDepthExceededError) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function patchComment(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  const reviewId = getNumberParam(req.params.reviewId);

  if (!omdbId || Number.isNaN(reviewId)) {
    res.status(400).json({ error: "Paramètres invalides" });
    return;
  }

  const userId = parseInt(req.session!.user.id, 10);
  const { comment } = req.body as { comment?: string };

  if (typeof comment !== "string") {
    res.status(400).json({ error: "Le champ comment est requis" });
    return;
  }

  try {
    await updateReviewComment({ omdbId, userId, reviewId, comment });
    res.status(204).send();
  } catch (error) {
    if (error instanceof FilmNotFoundError || error instanceof ReviewNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ForbiddenReviewActionError) {
      res.status(403).json({ error: error.message });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function removeComment(req: RequestWithSession, res: Response) {
  const omdbId = getOmdbId(req);
  const reviewId = getNumberParam(req.params.reviewId);

  if (!omdbId || Number.isNaN(reviewId)) {
    res.status(400).json({ error: "Paramètres invalides" });
    return;
  }

  const userId = parseInt(req.session!.user.id, 10);

  try {
    await deleteReviewComment({ omdbId, userId, reviewId });
    res.status(204).send();
  } catch (error) {
    if (error instanceof FilmNotFoundError || error instanceof ReviewNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof ForbiddenReviewActionError) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
}