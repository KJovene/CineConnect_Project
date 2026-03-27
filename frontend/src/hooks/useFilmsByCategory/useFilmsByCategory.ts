import { useQuery } from "@tanstack/react-query";
import {
  filmsByCategoryResponseSchema,
  type FilmsByCategoryResponse,
} from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchFilmsByCategory(
  limit: number,
): Promise<FilmsByCategoryResponse> {
  const res = await fetch(`${API_BASE}/api/categories/films?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement des films par catégorie");
  const raw = await res.json();
  const parsed = filmsByCategoryResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useFilmsByCategory] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useFilmsByCategory(limit = 24) {
  return useQuery({
    queryKey: ["movies", "by-category", limit],
    queryFn: () => fetchFilmsByCategory(limit),
    staleTime: 1000 * 60 * 15,
  });
}
