import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  filmReviewsResponseSchema,
  type FilmReviewComment,
  type ReviewReply,
  type CreateFilmCommentRequest,
  type UpdateFilmCommentRequest,
  type CreateFilmReplyRequest,
} from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";


const filmRatingSummarySchema = z.object({
  averageRating: z.number().nullable(),
  totalRatings: z.number(),
  userRating: z.number().nullable(),
});

const latestUserRatingSchema = z.object({
  reviewId: z.number(),
  filmId: z.number(),
  omdbId: z.string(),
  filmTitle: z.string(),
  posterUrl: z.string().nullable(),
  rating: z.number(),
  createdAt: z.string().nullable(),
});

const latestUserCommentSchema = z.object({
  reviewId: z.number(),
  filmId: z.number(),
  omdbId: z.string(),
  filmTitle: z.string(),
  posterUrl: z.string().nullable(),
  comment: z.string(),
  isReply: z.boolean(),
  createdAt: z.string().nullable(),
});

export type FilmRatingSummary = z.infer<typeof filmRatingSummarySchema>;
export type LatestUserRating = z.infer<typeof latestUserRatingSchema>;
export type LatestUserComment = z.infer<typeof latestUserCommentSchema>;
export type { FilmReviewComment, ReviewReply };

const PROFILE_HISTORY_LIMIT = 100;

function reviewsQueryKey(omdbId: string) {
  return ["films", omdbId, "reviews"] as const;
}

function ratingSummaryQueryKey(omdbId: string) {
  return ["films", omdbId, "rating-summary"] as const;
}

function movieDetailQueryKey(omdbId: string) {
  return ["movies", "detail", omdbId] as const;
}

function latestRatingsQueryKey() {
  return ["users", "me", "latest-ratings"] as const;
}

function latestCommentsQueryKey() {
  return ["users", "me", "latest-comments"] as const;
}

export function useMyLatestRatings() {
  return useQuery({
    queryKey: latestRatingsQueryKey(),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/users/me/latest-ratings?limit=${PROFILE_HISTORY_LIMIT}`,
      );
      const parsed = z.array(latestUserRatingSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[useMyLatestRatings] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
  });
}

export function useMyLatestComments() {
  return useQuery({
    queryKey: latestCommentsQueryKey(),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/users/me/latest-comments?limit=${PROFILE_HISTORY_LIMIT}`,
      );
      const parsed = z.array(latestUserCommentSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[useMyLatestComments] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
  });
}

export function useFilmReviews(omdbId: string) {
  return useQuery({
    queryKey: reviewsQueryKey(omdbId),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/films/${omdbId}/reviews`);
      const parsed = filmReviewsResponseSchema.safeParse(raw);
      if (!parsed.success) {
        console.error("[useFilmReviews] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
    enabled: !!omdbId,
  });
}

export function useFilmRatingSummary(omdbId: string) {
  return useQuery({
    queryKey: ratingSummaryQueryKey(omdbId),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/films/${omdbId}/reviews/rating-summary`,
      );
      const parsed = filmRatingSummarySchema.safeParse(raw);
      if (!parsed.success) {
        console.error("[useFilmRatingSummary] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
    enabled: !!omdbId,
  });
}

export function useUpsertFilmRating(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number }) =>
      apiClient.post<FilmRatingSummary>(
        `/films/${omdbId}/reviews/rating`,
        payload,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ratingSummaryQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
    },
  });
}

export function useCreateFilmComment(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFilmCommentRequest) =>
      apiClient.post(`/films/${omdbId}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: ratingSummaryQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(omdbId) });
    },
  });
}

export function useUpdateFilmComment(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: number;
      payload: UpdateFilmCommentRequest;
    }) => apiClient.patch(`/films/${omdbId}/reviews/${reviewId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: ratingSummaryQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(omdbId) });
    },
  });
}

export function useDeleteFilmComment(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) =>
      apiClient.delete(`/films/${omdbId}/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: ratingSummaryQueryKey(omdbId) });
      queryClient.invalidateQueries({ queryKey: movieDetailQueryKey(omdbId) });
    },
  });
}

export function useCreateFilmReply(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: number;
      payload: CreateFilmReplyRequest;
    }) =>
      apiClient.post(`/films/${omdbId}/reviews/${reviewId}/replies`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
    },
  });
}
