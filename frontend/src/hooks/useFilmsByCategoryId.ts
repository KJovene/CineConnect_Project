import { useQuery } from "@tanstack/react-query";
import type { Film } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchFilmsByCategoryId(
  categoryId: number,
  limit: number,
): Promise<Film[]> {
  const res = await fetch(
    `${API_BASE}/api/categories/${categoryId}/films?limit=${limit}`,
  );
  if (!res.ok) throw new Error("Erreur chargement des films de la catégorie");
  return res.json();
}

export function useFilmsByCategoryId(categoryId: number, limit = 100) {
  return useQuery({
    queryKey: ["movies", "by-category-id", categoryId, limit],
    queryFn: () => fetchFilmsByCategoryId(categoryId, limit),
    staleTime: 1000 * 60 * 15,
  });
}
