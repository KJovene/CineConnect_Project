import {
  searchResponseSchema,
  movieDetailsSchema,
} from "../schemas/moviesSchema";
import type { SearchResponse, MovieDetails } from "../schemas/moviesSchema";

// Vite (import.meta.env) et Node (process.env)
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const BASE_URL = "http://www.omdbapi.com/";

if (!API_KEY) {
  throw new Error("La clé API OMDB est manquante.");
}

//recherche des films
export async function searchMovies(query: string): Promise<SearchResponse> {
  const url = `${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  const parsed = searchResponseSchema.safeParse(data);

  if (!parsed.success) {
    // parsed.error contient le détail des erreurs de validation
    console.error("Erreur de validation OMDB:", parsed.error.issues);
    throw new Error("Réponse API invalide");
  }

  if (parsed.data.Response === "False") {
    throw new Error(parsed.data.Error || "Aucun résultat trouvé");
  }

  return parsed.data;
}

//le détails de chaque film récupérer par leur id
export async function getMovieById(imdbId: string): Promise<MovieDetails> {
  const url = `${BASE_URL}?i=${imdbId}&apikey=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  const parsed = movieDetailsSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Erreur de validation OMDB:", parsed.error.issues);
    throw new Error("Réponse API invalide");
  }

  if (parsed.data.Response === "False") {
    throw new Error("Film non trouvé");
  }

  return parsed.data;
}
