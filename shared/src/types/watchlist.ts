import { z } from "zod";
import { filmSchema } from "./films";

export const watchlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  movieId: z.string(),
  status: z.enum(["plan_to_watch", "watching", "completed"]),
  addedAt: z.coerce.date(),
});

export const watchlistResponseSchema = watchlistItemSchema.extend({
  movie: filmSchema.optional(),
});

export type WatchlistItem = z.infer<typeof watchlistItemSchema>;
export type WatchlistResponse = z.infer<typeof watchlistResponseSchema>;
