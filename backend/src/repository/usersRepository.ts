import { and, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { films, friends, reviews, user } from "../db/schema.js";

export async function findLatestRatingsByUserId(userId: number, limit: number) {
  return db
    .select({
      reviewId: reviews.review_id,
      filmId: reviews.film_id,
      omdbId: films.omdb_id,
      filmTitle: films.title,
      posterUrl: films.poster_url,
      rating: reviews.rating,
      createdAt: reviews.created_at,
    })
    .from(reviews)
    .innerJoin(films, eq(reviews.film_id, films.film_id))
    .where(
      and(
        eq(reviews.user_id, userId),
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(limit);
}

export async function findLatestCommentsByUserId(
  userId: number,
  limit: number,
) {
  return db
    .select({
      reviewId: reviews.review_id,
      filmId: reviews.film_id,
      omdbId: films.omdb_id,
      filmTitle: films.title,
      posterUrl: films.poster_url,
      comment: reviews.comment,
      parentReviewId: reviews.parent_review_id,
      createdAt: reviews.created_at,
    })
    .from(reviews)
    .innerJoin(films, eq(reviews.film_id, films.film_id))
    .where(
      and(
        eq(reviews.user_id, userId),
        sql`coalesce(trim(${reviews.comment}), '') <> ''`,
      ),
    )
    .orderBy(desc(reviews.created_at))
    .limit(limit);
}

export async function findUsersBySearch(search: string, limit: number) {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(user)
    .where(
      or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
    )
    .limit(limit);
}

export async function findUserRelationsWithOthers(
  userId: number,
  otherIds: number[],
) {
  if (otherIds.length === 0) return [];

  return db
    .select({
      user_id: friends.user_id,
      friend_user_id: friends.friend_user_id,
      status: friends.status,
    })
    .from(friends)
    .where(
      and(
        or(eq(friends.user_id, userId), eq(friends.friend_user_id, userId)),
        or(
          inArray(friends.user_id, otherIds),
          inArray(friends.friend_user_id, otherIds),
        ),
      ),
    );
}
