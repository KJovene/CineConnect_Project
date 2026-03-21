import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { films, reviews, user } from "../db/schema.js";

interface DbReviewRow {
  review_id: number;
  user_id: number;
  film_id: number;
  parent_review_id: number | null;
  rating: number;
  comment: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  user_name: string | null;
  user_image: string | null;
}

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
  const [film] = await db
    .select({ film_id: films.film_id })
    .from(films)
    .where(eq(films.omdb_id, omdbId))
    .limit(1);

  return film?.film_id ?? null;
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
  const [existing] = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      film_id: reviews.film_id,
      parent_review_id: reviews.parent_review_id,
      rating: reviews.rating,
      comment: reviews.comment,
    })
    .from(reviews)
    .where(eq(reviews.review_id, reviewId))
    .limit(1);

  return existing ?? null;
}

async function getParentReviewByUserAndFilm(params: {
  userId: number;
  filmId: number;
}) {
  const [existing] = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      film_id: reviews.film_id,
      parent_review_id: reviews.parent_review_id,
      rating: reviews.rating,
      comment: reviews.comment,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.user_id, params.userId),
        eq(reviews.film_id, params.filmId),
        isNull(reviews.parent_review_id),
      ),
    )
    .limit(1);

  return existing ?? null;
}

async function getReviewWithAuthorById(reviewId: number) {
  const [row] = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      film_id: reviews.film_id,
      parent_review_id: reviews.parent_review_id,
      rating: reviews.rating,
      comment: reviews.comment,
      created_at: reviews.created_at,
      updated_at: reviews.updated_at,
      user_name: user.name,
      user_image: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.user_id, user.id))
    .where(eq(reviews.review_id, reviewId))
    .limit(1);

  return row as DbReviewRow | undefined;
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

  const rows = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      film_id: reviews.film_id,
      parent_review_id: reviews.parent_review_id,
      rating: reviews.rating,
      comment: reviews.comment,
      created_at: reviews.created_at,
      updated_at: reviews.updated_at,
      user_name: user.name,
      user_image: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.user_id, user.id))
    .where(eq(reviews.film_id, filmId))
    .orderBy(desc(reviews.created_at));

  const parents = rows.filter(
    (row) =>
      row.parent_review_id === null && Boolean((row.comment ?? "").trim()),
  );
  const parentIds = parents.map((row) => row.review_id);

  const repliesRows =
    parentIds.length === 0
      ? []
      : await db
          .select({
            review_id: reviews.review_id,
            user_id: reviews.user_id,
            film_id: reviews.film_id,
            parent_review_id: reviews.parent_review_id,
            rating: reviews.rating,
            comment: reviews.comment,
            created_at: reviews.created_at,
            updated_at: reviews.updated_at,
            user_name: user.name,
            user_image: user.image,
          })
          .from(reviews)
          .innerJoin(user, eq(reviews.user_id, user.id))
          .where(inArray(reviews.parent_review_id, parentIds))
          .orderBy(asc(reviews.created_at));

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
  const existingParent = await getParentReviewByUserAndFilm({
    userId: params.userId,
    filmId,
  });

  let reviewId: number;

  if (existingParent) {
    await db
      .update(reviews)
      .set({
        comment,
        rating:
          optionalRating !== null ? optionalRating : existingParent.rating,
        updated_at: new Date(),
      })
      .where(eq(reviews.review_id, existingParent.review_id));

    reviewId = existingParent.review_id;
  } else {
    const [inserted] = await db
      .insert(reviews)
      .values({
        user_id: params.userId,
        film_id: filmId,
        parent_review_id: null,
        rating: optionalRating ?? 0,
        comment,
      })
      .returning({ review_id: reviews.review_id });

    reviewId = inserted.review_id;
  }

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
    await db
      .update(reviews)
      .set({
        rating,
        updated_at: new Date(),
      })
      .where(eq(reviews.review_id, existingParent.review_id));
    return;
  }

  await db.insert(reviews).values({
    user_id: params.userId,
    film_id: filmId,
    parent_review_id: null,
    rating,
    comment: null,
  });
}

export async function getFilmRatingSummary(params: {
  omdbId: string;
  userId?: number;
}): Promise<FilmRatingSummaryDto> {
  const filmId = await ensureFilmExists(params.omdbId);

  const [aggregate] = await db
    .select({
      averageRating: sql<number | null>`avg(${reviews.rating})::numeric(10,2)`,
      totalRatings: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.film_id, filmId),
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
      ),
    );

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

  const rows = await db
    .select({
      review_id: reviews.review_id,
      rating: reviews.rating,
      comment: reviews.comment,
      created_at: reviews.created_at,
      user_id: user.id,
      user_name: user.name,
      user_image: user.image,
      film_omdb_id: films.omdb_id,
      film_title: films.title,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.user_id, user.id))
    .innerJoin(films, eq(reviews.film_id, films.film_id))
    .where(
      and(
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
        sql`coalesce(length(trim(${reviews.comment})), 0) > 0`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(normalizedLimit);

  return rows.map((row) => ({
    reviewId: row.review_id,
    rating: row.rating,
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

  const parentRows = await db
    .select({ review_id: reviews.review_id })
    .from(reviews)
    .where(
      and(eq(reviews.user_id, params.userId), isNull(reviews.parent_review_id)),
    );

  const parentIds = parentRows.map((row) => row.review_id);
  if (parentIds.length === 0) return [];

  const rows = await db
    .select({
      reply_review_id: reviews.review_id,
      parent_review_id: reviews.parent_review_id,
      film_omdb_id: films.omdb_id,
      film_title: films.title,
      comment: reviews.comment,
      created_at: reviews.created_at,
      replier_id: user.id,
      replier_name: user.name,
      replier_image: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.user_id, user.id))
    .innerJoin(films, eq(reviews.film_id, films.film_id))
    .where(
      and(
        inArray(reviews.parent_review_id, parentIds),
        sql`${reviews.user_id} <> ${params.userId}`,
        sql`coalesce(length(trim(${reviews.comment})), 0) > 0`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(normalizedLimit);

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

  const [inserted] = await db
    .insert(reviews)
    .values({
      user_id: params.userId,
      film_id: filmId,
      parent_review_id: params.parentReviewId,
      rating: 0,
      comment,
    })
    .returning({ review_id: reviews.review_id });

  const [created] = await db
    .select({
      review_id: reviews.review_id,
      user_id: reviews.user_id,
      film_id: reviews.film_id,
      parent_review_id: reviews.parent_review_id,
      rating: reviews.rating,
      comment: reviews.comment,
      created_at: reviews.created_at,
      updated_at: reviews.updated_at,
      user_name: user.name,
      user_image: user.image,
    })
    .from(reviews)
    .innerJoin(user, eq(reviews.user_id, user.id))
    .where(eq(reviews.review_id, inserted.review_id))
    .limit(1);

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

  await db
    .update(reviews)
    .set({
      comment,
      updated_at: new Date(),
    })
    .where(
      and(eq(reviews.review_id, params.reviewId), eq(reviews.film_id, filmId)),
    );
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

  await db
    .delete(reviews)
    .where(
      and(eq(reviews.review_id, params.reviewId), eq(reviews.film_id, filmId)),
    );
}
