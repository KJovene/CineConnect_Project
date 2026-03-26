import type { Response } from "express";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import {
  createFilmCommentRequestSchema,
  createFilmReplyRequestSchema,
  updateFilmCommentRequestSchema,
  upsertRatingRequestSchema,
} from "@cineconnect/shared";
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
  return String(req.params.omdbId).trim();
}

function getNumberParam(value: string | string[] | undefined): number {
  return Number.parseInt(String(value), 10);
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

  const userId = Number.parseInt(String(req.session?.user?.id), 10);

  try {
    /* istanbul ignore next: guard kept for runtime robustness */
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
  const bodyResult = upsertRatingRequestSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Corps de requête invalide" });
    return;
  }
  const { rating } = bodyResult.data;

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
  const bodyResult = createFilmCommentRequestSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Corps de requête invalide" });
    return;
  }
  const { comment, rating } = bodyResult.data;

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
  const bodyResult = createFilmReplyRequestSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Corps de requête invalide" });
    return;
  }
  const { comment } = bodyResult.data;

  try {
    const created = await createReviewReply({
      omdbId,
      userId,
      parentReviewId: reviewId,
      comment,
    });
    res.status(201).json(created);
  } catch (error) {
    if (
      error instanceof FilmNotFoundError ||
      error instanceof ReviewNotFoundError
    ) {
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
  const bodyResult = updateFilmCommentRequestSchema.safeParse(req.body);
  if (!bodyResult.success) {
    res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Corps de requête invalide" });
    return;
  }
  const { comment } = bodyResult.data;

  try {
    await updateReviewComment({ omdbId, userId, reviewId, comment });
    res.status(204).send();
  } catch (error) {
    if (
      error instanceof FilmNotFoundError ||
      error instanceof ReviewNotFoundError
    ) {
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
    if (
      error instanceof FilmNotFoundError ||
      error instanceof ReviewNotFoundError
    ) {
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
