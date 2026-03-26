import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { films, reviews, user } from "../db/schema.js";

export interface ReviewRow {
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

export async function findFilmIdByOmdbId(omdbId: string) {
  const [film] = await db
    .select({ film_id: films.film_id })
    .from(films)
    .where(eq(films.omdb_id, omdbId))
    .limit(1);

  return film?.film_id ?? null;
}

export async function findReviewById(reviewId: number) {
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

export async function findParentReviewByUserAndFilm(params: {
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

export async function findReviewWithAuthorById(reviewId: number) {
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

  return row as ReviewRow | undefined;
}

export async function findReviewsWithAuthorByFilmId(filmId: number) {
  return db
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
}

export async function findRepliesWithAuthorByParentIds(parentIds: number[]) {
  if (parentIds.length === 0) return [];

  return db
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
}

export async function insertReviewReturningId(params: {
  userId: number;
  filmId: number;
  parentReviewId: number | null;
  rating: number;
  comment: string | null;
}) {
  const insertQuery = db.insert(reviews).values({
    user_id: params.userId,
    film_id: params.filmId,
    parent_review_id: params.parentReviewId,
    rating: params.rating,
    comment: params.comment,
  }) as unknown as {
    returning?: (projection: { review_id: typeof reviews.review_id }) => Promise<
      Array<{ review_id: number }>
    >;
  };

  if (typeof insertQuery.returning === "function") {
    const [inserted] = await insertQuery.returning({ review_id: reviews.review_id });
    return inserted.review_id;
  }

  return 0;
}

export async function updateReviewRating(reviewId: number, rating: number) {
  await db
    .update(reviews)
    .set({
      rating,
      updated_at: new Date(),
    })
    .where(eq(reviews.review_id, reviewId));
}

export async function findFilmRatingAggregate(filmId: number) {
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

  return aggregate;
}

export async function findLatestCommunityReviewsRows(limit: number) {
  return db
    .select({
      review_id: reviews.review_id,
      rating: reviews.rating,
      effective_rating: sql<number | null>`(
        select r2.rating
        from "reviews" r2
        where r2.user_id = ${reviews.user_id}
          and r2.film_id = ${reviews.film_id}
          and r2.parent_review_id is null
          and r2.rating > 0
        order by coalesce(r2.updated_at, r2.created_at) desc
        limit 1
      )`,
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
        sql`coalesce(length(trim(${reviews.comment})), 0) > 0`,
        sql`exists (
          select 1
          from "reviews" r2
          where r2.user_id = ${reviews.user_id}
            and r2.film_id = ${reviews.film_id}
            and r2.parent_review_id is null
            and r2.rating > 0
        )`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(limit);
}

export async function findParentReviewIdsByUserId(userId: number) {
  const rows = await db
    .select({ review_id: reviews.review_id })
    .from(reviews)
    .where(and(eq(reviews.user_id, userId), isNull(reviews.parent_review_id)));

  return rows.map((row) => row.review_id);
}

export async function findReplyNotificationRows(
  userId: number,
  parentIds: number[],
  limit: number,
) {
  if (parentIds.length === 0) return [];

  return db
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
        sql`${reviews.user_id} <> ${userId}`,
        sql`coalesce(length(trim(${reviews.comment})), 0) > 0`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(limit);
}

export async function updateReviewComment(reviewId: number, filmId: number, comment: string) {
  await db
    .update(reviews)
    .set({
      comment,
      updated_at: new Date(),
    })
    .where(and(eq(reviews.review_id, reviewId), eq(reviews.film_id, filmId)));
}

export async function deleteReviewByIdAndFilmId(reviewId: number, filmId: number) {
  await db
    .delete(reviews)
    .where(and(eq(reviews.review_id, reviewId), eq(reviews.film_id, filmId)));
}
