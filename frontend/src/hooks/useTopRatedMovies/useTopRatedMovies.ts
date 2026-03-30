import { useQuery } from "@tanstack/react-query";
import {
  topRatedResponseSchema,
  type TopRatedResponse,
} from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";

async function fetchTopRated(limit: number): Promise<TopRatedResponse> {
  try {
    const raw = await apiClient.get<unknown>(`/films/top-rated?limit=${limit}`);
    const parsed = topRatedResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[useTopRatedMovies] Réponse invalide:", parsed.error);
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Erreur chargement homepage");
    }
    throw error;
  }
}

export function useTopRatedMovies(limit = 10) {
  return useQuery({
    queryKey: ["movies", "top-rated", limit],
    queryFn: () => fetchTopRated(limit),
    staleTime: 1000 * 60 * 15,
  });
}
