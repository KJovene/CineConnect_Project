import { z } from "zod";
import { filmSchema } from "./films";
import { userSchema } from "./users";

export const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  movieId: z.string(),
  rating: z.number().min(1).max(10),
  comment: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const reviewResponseSchema = reviewSchema.extend({
  user: userSchema.optional(),
  movie: filmSchema.optional(),
});

export type Review = z.infer<typeof reviewSchema>;
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
