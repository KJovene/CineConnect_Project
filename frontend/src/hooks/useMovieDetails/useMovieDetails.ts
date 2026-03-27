import { useQuery } from "@tanstack/react-query";
import {
  filmDetailResponseSchema,
  type FilmDetailResponse,
} from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchFilmDetail(omdbId: string): Promise<FilmDetailResponse> {
  const res = await fetch(`${API_BASE}/api/films/${omdbId}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Film introuvable");
  }
  const raw = await res.json();
  const parsed = filmDetailResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useMovieDetails] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useMovieDetails(omdbId: string) {
  return useQuery({
    queryKey: ["movies", "detail", omdbId],
    queryFn: () => fetchFilmDetail(omdbId),
    enabled: !!omdbId,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
