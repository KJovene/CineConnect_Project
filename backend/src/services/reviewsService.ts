import {
  deleteReviewByIdAndFilmId,
  findFilmIdByOmdbId,
  findFilmRatingAggregate,
  findLatestCommunityReviewsRows,
  findParentReviewByUserAndFilm,
  findParentReviewIdsByUserId,
  findRepliesWithAuthorByParentIds,
  findReplyNotificationRows,
  findReviewById,
  findReviewsWithAuthorByFilmId,
  findReviewWithAuthorById,
  insertReviewReturningId,
  updateReviewComment as updateReviewCommentRecord,
  updateReviewRating,
  type ReviewRow,
} from "../repositories/reviewsRepository.js";

type DbReviewRow = ReviewRow;

export interface ReviewAuthorDto {
  id: number;
  name: string;
  image: string | null;
}

export interface ReviewReplyDto {
  reviewId: number;
  filmId: number;
  parentReviewId: number;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: ReviewAuthorDto;
}

export interface ReviewCommentDto {
  reviewId: number;
  filmId: number;
  parentReviewId: null;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: ReviewAuthorDto;
  replies: ReviewReplyDto[];
}

interface ReviewBaseDto {
  reviewId: number;
  filmId: number;
  parentReviewId: number | null;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: ReviewAuthorDto;
}

export class FilmNotFoundError extends Error {}
export class ReviewNotFoundError extends Error {}
export class ForbiddenReviewActionError extends Error {}
export class ReplyDepthExceededError extends Error {}

export interface FilmRatingSummaryDto {
  averageRating: number | null;
  totalRatings: number;
  userRating: number | null;
}

export interface CommunityReviewDto {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string | null;
  author: ReviewAuthorDto;
  film: {
    omdbId: string;
    title: string;
  };
}

export interface UserCommentReplyNotificationDto {
  replyReviewId: number;
  parentReviewId: number;
  omdbId: string;
  filmTitle: string;
  replier: ReviewAuthorDto;
  comment: string;
  createdAt: string | null;
}

function normalizeRating(value: number): number {
  const rating = Number.parseInt(String(value), 10);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error("La note doit être un entier entre 1 et 5");
  }
  return rating;
}

function normalizeOptionalRating(value: number | undefined): number | null {
  if (typeof value !== "number") return null;
  return normalizeRating(value);
}

async function getFilmIdByOmdbId(omdbId: string): Promise<number | null> {
  return findFilmIdByOmdbId(omdbId);
}

function mapReviewRow(row: DbReviewRow): ReviewBaseDto {
  return {
    reviewId: row.review_id,
    filmId: row.film_id,
    parentReviewId: row.parent_review_id,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    author: {
      id: row.user_id,
      name: row.user_name ?? "Utilisateur",
      image: row.user_image,
    },
  };
}

async function getReviewById(reviewId: number) {
  return findReviewById(reviewId);
}

async function getParentReviewByUserAndFilm(params: {
  userId: number;
  filmId: number;
}) {
  return findParentReviewByUserAndFilm(params);
}

async function getReviewWithAuthorById(reviewId: number) {
  return findReviewWithAuthorById(reviewId);
}

async function ensureFilmExists(omdbId: string): Promise<number> {
  const filmId = await getFilmIdByOmdbId(omdbId);
  if (!filmId) throw new FilmNotFoundError(`Film ${omdbId} introuvable`);
  return filmId;
}

export async function getFilmComments(
  omdbId: string,
): Promise<ReviewCommentDto[]> {
  const filmId = await ensureFilmExists(omdbId);

  const rows = await findReviewsWithAuthorByFilmId(filmId);

  const parents = rows.filter(
    (row) =>
      row.parent_review_id === null && Boolean((row.comment ?? "").trim()),
  );
  const parentIds = parents.map((row) => row.review_id);

  const repliesRows = await findRepliesWithAuthorByParentIds(parentIds);

  const repliesByParent = new Map<number, ReviewReplyDto[]>();

  for (const reply of repliesRows as DbReviewRow[]) {
    if (reply.parent_review_id === null) continue;

    const item: ReviewReplyDto = {
      ...mapReviewRow(reply),
      parentReviewId: reply.parent_review_id,
    };

    const existing = repliesByParent.get(reply.parent_review_id) ?? [];
    existing.push(item);
    repliesByParent.set(reply.parent_review_id, existing);
  }

  return (parents as DbReviewRow[]).map((row) => ({
    ...mapReviewRow(row),
    parentReviewId: null,
    replies: repliesByParent.get(row.review_id) ?? [],
  }));
}

export async function createFilmComment(params: {
  omdbId: string;
  userId: number;
  comment: string;
  rating?: number;
}): Promise<ReviewCommentDto> {
  const filmId = await ensureFilmExists(params.omdbId);

  const comment = params.comment.trim();
  if (!comment) throw new Error("Le commentaire ne peut pas être vide");

  const optionalRating = normalizeOptionalRating(params.rating);
  const reviewId = await insertReviewReturningId({
    userId: params.userId,
    filmId,
    parentReviewId: null,
    rating: optionalRating ?? 0,
    comment,
  });

  const created = await getReviewWithAuthorById(reviewId);
  if (!created) {
    throw new ReviewNotFoundError("Commentaire introuvable");
  }

  const mapped = mapReviewRow(created);
  return { ...mapped, parentReviewId: null, replies: [] };
}

export async function upsertFilmRating(params: {
  omdbId: string;
  userId: number;
  rating: number;
}): Promise<void> {
  const filmId = await ensureFilmExists(params.omdbId);
  const rating = normalizeRating(params.rating);

  const existingParent = await getParentReviewByUserAndFilm({
    userId: params.userId,
    filmId,
  });

  if (existingParent) {
    await updateReviewRating(existingParent.review_id, rating);
    return;
  }

  await insertReviewReturningId({
    userId: params.userId,
    filmId,
    parentReviewId: null,
    rating,
    comment: null,
  });
}

export async function getFilmRatingSummary(params: {
  omdbId: string;
  userId?: number;
}): Promise<FilmRatingSummaryDto> {
  const filmId = await ensureFilmExists(params.omdbId);

  const aggregate = await findFilmRatingAggregate(filmId);

  let userRating: number | null = null;
  if (typeof params.userId === "number") {
    const userReview = await getParentReviewByUserAndFilm({
      userId: params.userId,
      filmId,
    });
    userRating = userReview && userReview.rating > 0 ? userReview.rating : null;
  }

  return {
    averageRating:
      aggregate?.averageRating === null ||
      aggregate?.averageRating === undefined
        ? null
        : Number(aggregate.averageRating),
    totalRatings: Number(aggregate?.totalRatings ?? 0),
    userRating,
  };
}

export async function getLatestCommunityReviews(
  limit = 4,
): Promise<CommunityReviewDto[]> {
  const normalizedLimit = Math.min(Math.max(Math.trunc(limit), 1), 12);

  const rows = await findLatestCommunityReviewsRows(normalizedLimit);

  return rows.map((row) => ({
    reviewId: row.review_id,
    rating: row.effective_rating ?? row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    author: {
      id: row.user_id,
      name: row.user_name ?? "Utilisateur",
      image: row.user_image,
    },
    film: {
      omdbId: row.film_omdb_id ?? "",
      title: row.film_title,
    },
  }));
}

export async function getUserCommentReplyNotifications(params: {
  userId: number;
  limit?: number;
}): Promise<UserCommentReplyNotificationDto[]> {
  const normalizedLimit = Math.min(
    Math.max(Math.trunc(params.limit ?? 20), 1),
    100,
  );

  const parentIds = await findParentReviewIdsByUserId(params.userId);
  if (parentIds.length === 0) return [];

  const rows = await findReplyNotificationRows(
    params.userId,
    parentIds,
    normalizedLimit,
  );

  return rows
    .filter((row) => row.parent_review_id !== null)
    .map((row) => ({
      replyReviewId: row.reply_review_id,
      parentReviewId: row.parent_review_id as number,
      omdbId: row.film_omdb_id ?? "",
      filmTitle: row.film_title,
      replier: {
        id: row.replier_id,
        name: row.replier_name ?? "Utilisateur",
        image: row.replier_image,
      },
      comment: row.comment ?? "",
      createdAt: row.created_at ? row.created_at.toISOString() : null,
    }));
}

export async function createReviewReply(params: {
  omdbId: string;
  userId: number;
  parentReviewId: number;
  comment: string;
}): Promise<ReviewReplyDto> {
  const filmId = await ensureFilmExists(params.omdbId);

  const parent = await getReviewById(params.parentReviewId);
  if (!parent || parent.film_id !== filmId) {
    throw new ReviewNotFoundError("Commentaire parent introuvable");
  }

  if (parent.parent_review_id !== null) {
    throw new ReplyDepthExceededError("Impossible de répondre à une réponse");
  }

  const comment = params.comment.trim();
  if (!comment) throw new Error("La réponse ne peut pas être vide");

  const insertedId = await insertReviewReturningId({
    userId: params.userId,
    filmId,
    parentReviewId: params.parentReviewId,
    rating: 0,
    comment,
  });

  const created = await findReviewWithAuthorById(insertedId);
  if (!created) {
    throw new ReviewNotFoundError("Réponse introuvable");
  }

  const mapped = mapReviewRow(created as DbReviewRow);
  return {
    ...mapped,
    parentReviewId: params.parentReviewId,
  };
}

export async function updateReviewComment(params: {
  omdbId: string;
  userId: number;
  reviewId: number;
  comment: string;
}): Promise<void> {
  const filmId = await ensureFilmExists(params.omdbId);

  const existing = await getReviewById(params.reviewId);
  if (!existing || existing.film_id !== filmId) {
    throw new ReviewNotFoundError("Commentaire introuvable");
  }

  if (existing.user_id !== params.userId) {
    throw new ForbiddenReviewActionError("Action non autorisée");
  }

  const comment = params.comment.trim();
  if (!comment) throw new Error("Le commentaire ne peut pas être vide");

  await updateReviewCommentRecord(params.reviewId, filmId, comment);
}

export async function deleteReviewComment(params: {
  omdbId: string;
  userId: number;
  reviewId: number;
}): Promise<void> {
  const filmId = await ensureFilmExists(params.omdbId);

  const existing = await getReviewById(params.reviewId);
  if (!existing || existing.film_id !== filmId) {
    throw new ReviewNotFoundError("Commentaire introuvable");
  }

  if (existing.user_id !== params.userId) {
    throw new ForbiddenReviewActionError("Action non autorisée");
  }

  await deleteReviewByIdAndFilmId(params.reviewId, filmId);
}
