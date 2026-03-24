import type { Film } from "./films";
import type { User } from "./users";

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResponse extends Review {
  user?: User;
  movie?: Film;
}
