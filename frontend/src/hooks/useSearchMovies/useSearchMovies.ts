import { useQuery } from "@tanstack/react-query";
import { searchResponseSchema, type SearchResponse } from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";

async function searchMovies(
  query: string,
  page: number,
): Promise<SearchResponse> {
  try {
    const raw = await apiClient.get<unknown>(
      `/films/search?q=${encodeURIComponent(query)}&page=${page}`,
    );
    const parsed = searchResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[useSearchMovies] Réponse invalide:", parsed.error);
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Erreur de recherche");
    }
    throw error;
  }
}

export function useSearchMovies(query: string, page = 1) {
  return useQuery({
    queryKey: ["movies", "search", query, page],
    queryFn: () => searchMovies(query, page),
    enabled: !!query && query.length >= 3,
    staleTime: 1000 * 60 * 5,
  });
}
