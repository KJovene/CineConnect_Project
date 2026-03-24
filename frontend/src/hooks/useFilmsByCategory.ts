import { useQuery } from "@tanstack/react-query";
import type { FilmsByCategoryResponse } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchFilmsByCategory(
  limit: number,
): Promise<FilmsByCategoryResponse> {
  const res = await fetch(`${API_BASE}/api/categories/films?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement des films par catégorie");
  return res.json();
}

export function useFilmsByCategory(limit = 24) {
  return useQuery({
    queryKey: ["movies", "by-category", limit],
    queryFn: () => fetchFilmsByCategory(limit),
    staleTime: 1000 * 60 * 15, // 15 min — données stables
  });
}
