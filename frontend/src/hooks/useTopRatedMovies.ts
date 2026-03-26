import { useQuery } from "@tanstack/react-query";
import { topRatedResponseSchema, type TopRatedResponse } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchTopRated(limit: number): Promise<TopRatedResponse> {
  const res = await fetch(`${API_BASE}/api/films/top-rated?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement homepage");
  const raw = await res.json();
  const parsed = topRatedResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useTopRatedMovies] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useTopRatedMovies(limit = 10) {
  return useQuery({
    queryKey: ["movies", "top-rated", limit],
    queryFn: () => fetchTopRated(limit),
    staleTime: 1000 * 60 * 15, // 15 min — données stables
  });
}
