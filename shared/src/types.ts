// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse extends Omit<User, "id"> {
  id: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Film Types
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

// Résultat de recherche — retournée par GET /api/films/search
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

// Détail complet — retourné par GET /api/films/:omdbId
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

// Films à la une — retourné par GET /api/films/top-rated
export type TopRatedResponse = Film[];

// Catégorie avec ses films — retourné par GET /api/films/by-genre
export interface GenreSection {
  genre: string;
  films: Film[];
}

export type FilmsByGenreResponse = GenreSection[];

// Review Types
export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number; // 1-10
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse extends Review {
  user?: User;
  movie?: Film;
}

// List Types
export interface List {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListResponse extends List {
  movies?: Film[];
  movieCount?: number;
}

// Watchlist Types
export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  status: "plan_to_watch" | "watching" | "completed";
  addedAt: Date;
}

export interface WatchlistResponse extends WatchlistItem {
  movie?: Film;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Socket Events Types
export interface SocketEvents {
  "user:online": { userId: string };
  "user:offline": { userId: string };
  "review:created": ReviewResponse;
  "review:updated": ReviewResponse;
  "review:deleted": { reviewId: string };
}
