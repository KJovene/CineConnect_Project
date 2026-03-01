import { useQuery } from "@tanstack/react-query";
import type { TopRatedResponse } from "@cineconnect/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function fetchTopRated(limit = 10): Promise<TopRatedResponse> {
  const res = await fetch(`${API_BASE}/api/films/top-rated?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement homepage");
  return res.json();
}

export function useTopRatedMovies(limit = 10) {
  return useQuery({
    queryKey: ["movies", "top-rated", limit],
    queryFn:  () => fetchTopRated(limit),
    staleTime: 1000 * 60 * 15, // 15 min — données stables
  });
}