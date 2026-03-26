import { z } from "zod";

export const movieSearchItemSchema = z.object({
  Title: z.string(), 
  Year: z.string(), 
  imdbID: z.string(),
  Type: z.string(), 
  Poster: z.string(), 
});

export type MovieSearchItem = z.infer<typeof movieSearchItemSchema>;

export const searchResponseSchema = z.object({
  
  Response: z.enum(["True", "False"]),
  
  Search: z.array(movieSearchItemSchema).optional(),
  totalResults: z.string().optional(),
  
  Error: z.string().optional(),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const movieDetailsSchema = z.object({
  Title: z.string(),
  Year: z.string(),
  Rated: z.string(),
  Released: z.string(),
  Runtime: z.string(),
  Genre: z.string(),
  Director: z.string(),
  Writer: z.string(),
  Actors: z.string(),
  Plot: z.string(),
  Language: z.string(),
  Country: z.string(),
  Awards: z.string(),
  Poster: z.string(),
  Ratings: z.array(z.object({
    Source: z.string(),
    Value: z.string(),
  })),
  Metascore: z.string(),
  imdbRating: z.string(),
  imdbVotes: z.string(),
  imdbID: z.string(),
  Type: z.string(),
  DVD: z.string().optional(),
  BoxOffice: z.string().optional(),
  Production: z.string().optional(),
  Website: z.string().optional(),
  Response: z.string(),
});

export type MovieDetails = z.infer<typeof movieDetailsSchema>;