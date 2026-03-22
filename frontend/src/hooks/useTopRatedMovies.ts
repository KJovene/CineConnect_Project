import { useQuery } from "@tanstack/react-query";
import type { TopRatedResponse } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchTopRated(limit: number): Promise<TopRatedResponse> {
  const res = await fetch(`${API_BASE}/api/films/top-rated?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement homepage");
  return res.json();
}

export function useTopRatedMovies(limit = 10) {
  return useQuery({
    queryKey: ["movies", "top-rated", limit],
    queryFn: () => fetchTopRated(limit),
    staleTime: 1000 * 60 * 15, // 15 min — données stables
  });
}
