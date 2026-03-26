import { useQuery } from "@tanstack/react-query";
import { filmSchema, type Film } from "@cineconnect/shared";
import { z } from "zod";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

const filmArraySchema = z.array(filmSchema);

async function fetchFilmsByCategoryId(
  categoryId: number,
  limit: number,
): Promise<Film[]> {
  const res = await fetch(
    `${API_BASE}/api/categories/${categoryId}/films?limit=${limit}`,
  );
  if (!res.ok) throw new Error("Erreur chargement des films de la catégorie");
  const raw = await res.json();
  const parsed = filmArraySchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useFilmsByCategoryId] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useFilmsByCategoryId(categoryId: number, limit = 100) {
  return useQuery({
    queryKey: ["movies", "by-category-id", categoryId, limit],
    queryFn: () => fetchFilmsByCategoryId(categoryId, limit),
    staleTime: 1000 * 60 * 15,
  });
}
