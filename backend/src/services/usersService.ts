import {
  findLatestCommentsByUserId,
  findLatestRatingsByUserId,
  findUserRelationsWithOthers,
  findUsersBySearch,
} from "../repository/usersRepository.js";
import { getUserCommentReplyNotifications } from "./reviewsService.js";
import type { PaginationQuery } from "../types/index.js";

function getClampedLimit(query: PaginationQuery, fallback: number): number {
  const rawValue = query.limit ?? query.pageSize;
  const parsed = Number.parseInt(String(rawValue ?? fallback), 10);
  const normalized = Number.isNaN(parsed) ? fallback : Math.trunc(parsed);
  return Math.min(Math.max(normalized, 1), 200);
}

export async function getLatestRatings(
  userId: number,
  query: PaginationQuery,
) {
  const normalizedLimit = getClampedLimit(query, 100);
  const rows = await findLatestRatingsByUserId(userId, normalizedLimit);

  return rows.map((row) => ({
    reviewId: row.reviewId,
    filmId: row.filmId,
    omdbId: row.omdbId,
    filmTitle: row.filmTitle,
    posterUrl: row.posterUrl,
    rating: row.rating,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

export async function getLatestComments(
  userId: number,
  query: PaginationQuery,
) {
  const normalizedLimit = getClampedLimit(query, 100);
  const rows = await findLatestCommentsByUserId(userId, normalizedLimit);

  return rows.map((row) => ({
    reviewId: row.reviewId,
    filmId: row.filmId,
    omdbId: row.omdbId,
    filmTitle: row.filmTitle,
    posterUrl: row.posterUrl,
    comment: row.comment ?? "",
    isReply: row.parentReviewId !== null,
    createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  }));
}

export async function getCommentReplies(userId: number, query: PaginationQuery) {
  const limit = getClampedLimit(query, 20);

  return getUserCommentReplyNotifications({
    userId,
    limit,
  });
}

export async function searchUsers(userId: number, search: string) {
  if (search.length < 2) {
    return [];
  }

  const results = await findUsersBySearch(search, 20);
  const others = results.filter((candidate) => candidate.id !== userId);

  if (others.length === 0) {
    return [];
  }

  const otherIds = others.map((candidate) => candidate.id);
  const relations = await findUserRelationsWithOthers(userId, otherIds);

  const statusMap = new Map<number, string>();
  for (const relation of relations) {
    const otherId =
      relation.user_id === userId ? relation.friend_user_id : relation.user_id;
    statusMap.set(otherId, relation.status ?? "pending");
  }

  return others.map((candidate) => ({
    ...candidate,
    relationStatus: statusMap.get(candidate.id) ?? null,
  }));
}