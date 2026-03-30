import { useQuery } from "@tanstack/react-query";
import { filmSchema, type Film } from "@cineconnect/shared";
import { z } from "zod";
import { apiClient } from "@/lib/apiClient";

const filmArraySchema = z.array(filmSchema);

async function fetchFilmsByCategoryId(
  categoryId: number,
  limit: number,
): Promise<Film[]> {
  try {
    const raw = await apiClient.get<unknown>(
      `/categories/${categoryId}/films?limit=${limit}`,
    );
    const parsed = filmArraySchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[useFilmsByCategoryId] Réponse invalide:", parsed.error);
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Erreur chargement des films de la catégorie");
    }
    throw error;
  }
}

export function useFilmsByCategoryId(categoryId: number, limit = 100) {
  return useQuery({
    queryKey: ["movies", "by-category-id", categoryId, limit],
    queryFn: () => fetchFilmsByCategoryId(categoryId, limit),
    staleTime: 1000 * 60 * 15,
  });
}
