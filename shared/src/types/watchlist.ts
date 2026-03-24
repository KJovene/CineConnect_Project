import type { Film } from "./films";

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
