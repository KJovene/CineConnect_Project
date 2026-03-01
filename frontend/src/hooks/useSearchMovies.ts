import { useQuery } from "@tanstack/react-query";
import type { SearchResponse } from "@cineconnect/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function searchMovies(query: string, page = 1): Promise<SearchResponse> {
  const res = await fetch(
    `${API_BASE}/api/films/search?q=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Erreur de recherche");
  }
  return await res.json();
}

export function useSearchMovies(query: string, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn:  () => searchMovies(query, page),
    enabled:  !!query && query.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 min — pas besoin de recharger souvent, c'est en BDD
  });
}