import { useQuery } from "@tanstack/react-query";
import {
  communityReviewsResponseSchema,
  type CommunityReviewsResponse,
} from "@cineconnect/shared";
import { apiClient } from "@/lib/apiClient";

async function fetchLatestCommunityReviews(
  limit: number,
): Promise<CommunityReviewsResponse> {
  try {
    const raw = await apiClient.get<unknown>(
      `/films/community-reviews?limit=${limit}`,
    );
    const parsed = communityReviewsResponseSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "[useLatestCommunityReviews] Réponse invalide:",
        parsed.error,
      );
      throw new Error("Réponse API invalide");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof Error && /^HTTP\s\d+$/.test(error.message)) {
      throw new Error("Erreur chargement des avis de la communauté");
    }
    throw error;
  }
}

export function useLatestCommunityReviews(limit = 4) {
  return useQuery({
    queryKey: ["reviews", "community", limit],
    queryFn: () => fetchLatestCommunityReviews(limit),
    staleTime: 1000 * 60 * 2,
  });
}
