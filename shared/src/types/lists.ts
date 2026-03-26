import { z } from "zod";
import { filmSchema } from "./films";

export const listSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listResponseSchema = listSchema.extend({
  movies: z.array(filmSchema).optional(),
  movieCount: z.number().optional(),
});

export type List = z.infer<typeof listSchema>;
export type ListResponse = z.infer<typeof listResponseSchema>;
