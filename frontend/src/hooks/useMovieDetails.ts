import { useQuery } from "@tanstack/react-query";
import type { FilmDetailResponse } from "@cineconnect/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function fetchFilmDetail(omdbId: string): Promise<FilmDetailResponse> {
  const res = await fetch(`${API_BASE}/api/films/${omdbId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Film introuvable");
  }
  return res.json();
}

export function useMovieDetails(omdbId: string) {
  return useQuery({
    queryKey: ["movies", "detail", omdbId],
    queryFn:  () => fetchFilmDetail(omdbId),
    enabled:  !!omdbId,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}