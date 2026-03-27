import { z } from "zod";

export const filmSchema = z.object({
  film_id: z.number(),
  omdb_id: z.string(),
  title: z.string(),
  year: z.number().nullable(),
  type: z.literal("movie").nullable(),
  director: z.string().nullable(),
  poster_url: z.string().nullable(),
  genre: z.string().nullable(),
  plot: z.string().nullable(),
  runtime: z.string().nullable(),
  omdb_rating: z.string().nullable(),
  average_rating: z.number().nullable().optional(),
  ratings_count: z.number().optional(),
  awards: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const filmSearchResultSchema = z.object({
  omdb_id: z.string(),
  title: z.string(),
  year: z.number().nullable(),
  type: z.literal("movie").nullable(),
  poster_url: z.string().nullable(),
});

export const searchResponseSchema = z.object({
  results: z.array(filmSearchResultSchema),
  totalResults: z.number(),
  page: z.number(),
});

export const filmDetailResponseSchema = filmSchema.extend({
  average_rating: z.number().nullable(),
  ratings_count: z.number(),
  user_rating: z.number().nullable(),
});

export const reviewAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  image: z.string().nullable(),
});

export const reviewReplySchema = z.object({
  reviewId: z.number(),
  filmId: z.number(),
  parentReviewId: z.number(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  author: reviewAuthorSchema,
});

export const filmReviewCommentSchema = z.object({
  reviewId: z.number(),
  filmId: z.number(),
  parentReviewId: z.null(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  author: reviewAuthorSchema,
  replies: z.array(reviewReplySchema),
});

export const filmReviewsResponseSchema = z.array(filmReviewCommentSchema);

export const createFilmCommentRequestSchema = z.object({
  comment: z.string().min(1),
  rating: z.number().min(1).max(10).optional(),
});

export const updateFilmCommentRequestSchema = z.object({
  comment: z.string().min(1),
});

export const createFilmReplyRequestSchema = z.object({
  comment: z.string().min(1),
});

export const upsertRatingRequestSchema = z.object({
  rating: z.number().min(1).max(10),
});

export const communityReviewSchema = z.object({
  reviewId: z.number(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.string().nullable(),
  author: reviewAuthorSchema,
  film: z.object({
    omdbId: z.string(),
    title: z.string(),
  }),
});

export const communityReviewsResponseSchema = z.array(communityReviewSchema);

export const topRatedResponseSchema = z.array(filmSchema);

export const genreSectionSchema = z.object({
  genre: z.string(),
  films: z.array(filmSchema),
});

export const filmsByGenreResponseSchema = z.array(genreSectionSchema);

export const categorySchema = z.object({
  category_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

export const categorySectionSchema = z.object({
  category: categorySchema,
  films: z.array(filmSchema),
});

export const filmsByCategoryResponseSchema = z.array(categorySectionSchema);

// Types inférés automatiquement
export type Film = z.infer<typeof filmSchema>;
export type FilmSearchResult = z.infer<typeof filmSearchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type FilmDetailResponse = z.infer<typeof filmDetailResponseSchema>;
export type ReviewAuthor = z.infer<typeof reviewAuthorSchema>;
export type ReviewReply = z.infer<typeof reviewReplySchema>;
export type FilmReviewComment = z.infer<typeof filmReviewCommentSchema>;
export type FilmReviewsResponse = z.infer<typeof filmReviewsResponseSchema>;
export type CreateFilmCommentRequest = z.infer<
  typeof createFilmCommentRequestSchema
>;
export type UpdateFilmCommentRequest = z.infer<
  typeof updateFilmCommentRequestSchema
>;
export type CreateFilmReplyRequest = z.infer<
  typeof createFilmReplyRequestSchema
>;
export type CommunityReview = z.infer<typeof communityReviewSchema>;
export type CommunityReviewsResponse = z.infer<
  typeof communityReviewsResponseSchema
>;
export type TopRatedResponse = z.infer<typeof topRatedResponseSchema>;
export type GenreSection = z.infer<typeof genreSectionSchema>;
export type FilmsByGenreResponse = z.infer<typeof filmsByGenreResponseSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategorySection = z.infer<typeof categorySectionSchema>;
export type FilmsByCategoryResponse = z.infer<
  typeof filmsByCategoryResponseSchema
>;
