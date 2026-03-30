import { useQuery } from "@tanstack/react-query";
import {
  filmDetailResponseSchema,
  type FilmDetailResponse,
} from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";

async function fetchFilmDetail(omdbId: string): Promise<FilmDetailResponse> {
  try {
    const raw = await apiClient.get<unknown>(`/films/${omdbId}`);
    const parsed = filmDetailResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[useMovieDetails] Réponse invalide:", parsed.error);
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Film introuvable");
    }
    throw error;
  }
}

export function useMovieDetails(omdbId: string) {
  return useQuery({
    queryKey: ["movies", "detail", omdbId],
    queryFn: () => fetchFilmDetail(omdbId),
    enabled: !!omdbId,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
