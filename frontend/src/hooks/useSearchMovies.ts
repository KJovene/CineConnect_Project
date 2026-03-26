import { useQuery } from "@tanstack/react-query";
import { searchResponseSchema, type SearchResponse } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function searchMovies(
  query: string,
  page: number,
): Promise<SearchResponse> {
  const res = await fetch(
    `${API_BASE}/api/films/search?q=${encodeURIComponent(query)}&page=${page}`,
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Erreur de recherche");
  }
  const raw = await res.json();
  const parsed = searchResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useSearchMovies] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useSearchMovies(query: string, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () => searchMovies(query, page),
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 min — pas besoin de recharger souvent, c'est en BDD
  });
}
