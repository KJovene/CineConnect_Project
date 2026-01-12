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

// Movie Types
export interface Movie {
  id: string;
  imdbId: string;
  title: string;
  poster?: string;
  year?: number;
  type: "movie" | "series";
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieResponse extends Movie {
  ratings?: number;
}

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
  movie?: Movie;
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
  movies?: Movie[];
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
  movie?: Movie;
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
