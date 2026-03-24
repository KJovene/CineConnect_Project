export interface Film {
  film_id: number;
  omdb_id: string;
  title: string;
  year: number | null;
  type: "movie" | null;
  director: string | null;
  poster_url: string | null;
  genre: string | null;
  plot: string | null;
  runtime: string | null;
  imdb_rating: string | null;
  average_rating?: number | null;
  ratings_count?: number;
  awards: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmSearchResult {
  omdb_id: string;
  title: string;
  year: number | null;
  type: "movie" | null;
  poster_url: string | null;
}

export interface SearchResponse {
  results: FilmSearchResult[];
  totalResults: number;
  page: number;
}

export interface FilmDetailResponse extends Film {
  average_rating: number | null;
  ratings_count: number;
  user_rating: number | null;
}

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

export type FilmReviewsResponse = FilmReviewComment[];

export interface CreateFilmCommentRequest {
  comment: string;
  rating?: number;
}

export interface UpdateFilmCommentRequest {
  comment: string;
}

export interface CreateFilmReplyRequest {
  comment: string;
}

export interface CommunityReview {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string | null;
  author: ReviewAuthor;
  film: {
    omdbId: string;
    title: string;
  };
}

export type CommunityReviewsResponse = CommunityReview[];

export type TopRatedResponse = Film[];

export interface GenreSection {
  genre: string;
  films: Film[];
}

export type FilmsByGenreResponse = GenreSection[];

export interface Category {
  category_id: number;
  name: string;
  description: string | null;
}

export interface CategorySection {
  category: Category;
  films: Film[];
}

export type FilmsByCategoryResponse = CategorySection[];
