import { useQuery } from "@tanstack/react-query";
import type { FilmsByGenreResponse } from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchFilmsByGenre(limit: number): Promise<FilmsByGenreResponse> {
  const res = await fetch(`${API_BASE}/api/films/by-genre?limit=${limit}`);
  if (!res.ok) throw new Error("Erreur chargement des films par genre");
  return res.json();
}

export function useFilmsByGenre(limit = 24) {
  return useQuery({
    queryKey: ["movies", "by-genre", limit],
    queryFn: () => fetchFilmsByGenre(limit),
    staleTime: 1000 * 60 * 15, // 15 min — données stables
  });
}
