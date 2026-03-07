import { useQuery } from "@tanstack/react-query";
import type { FilmsByGenreResponse } from "@cineconnect/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function fetchFilmsByGenre(limit = 24): Promise<FilmsByGenreResponse> {
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
