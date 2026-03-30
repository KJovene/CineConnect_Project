import { useQuery } from "@tanstack/react-query";
import {
  filmsByCategoryResponseSchema,
  type FilmsByCategoryResponse,
} from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";

async function fetchFilmsByCategory(
  limit: number,
): Promise<FilmsByCategoryResponse> {
  try {
    const raw = await apiClient.get<unknown>(
      `/categories/films?limit=${limit}`,
    );
    const parsed = filmsByCategoryResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[useFilmsByCategory] Réponse invalide:", parsed.error);
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Erreur chargement des films par catégorie");
    }
    throw error;
  }
}

export function useFilmsByCategory(limit = 24) {
  return useQuery({
    queryKey: ["movies", "by-category", limit],
    queryFn: () => fetchFilmsByCategory(limit),
    staleTime: 1000 * 60 * 15,
  });
}
