import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface ReviewAuthor {
  id: number;
  name: string;
  image: string | null;
}

export interface ReviewReply {
  reviewId: number;
  filmId: number;
  parentReviewId: number;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: ReviewAuthor;
}

export interface FilmReviewComment {
  reviewId: number;
  filmId: number;
  parentReviewId: null;
  rating: number;
  comment: string;
  createdAt: string | null;
  updatedAt: string | null;
  author: ReviewAuthor;
  replies: ReviewReply[];
}

type FilmReviewsResponse = FilmReviewComment[];

interface CreateFilmCommentRequest {
  comment: string;
  rating?: number;
}

interface UpdateFilmCommentRequest {
  comment: string;
}

interface CreateFilmReplyRequest {
  comment: string;
}

function reviewsQueryKey(omdbId: string) {
  return ["films", omdbId, "reviews"] as const;
}

export function useFilmReviews(omdbId: string) {
  return useQuery({
    queryKey: reviewsQueryKey(omdbId),
    queryFn: () =>
      apiClient.get<FilmReviewsResponse>(`/films/${omdbId}/reviews`),
    enabled: !!omdbId,
  });
}

export function useCreateFilmComment(omdbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFilmCommentRequest) =>
      apiClient.post(`/films/${omdbId}/reviews`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKey(omdbId) });
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
