import { useQuery } from "@tanstack/react-query";
import {
  communityReviewsResponseSchema,
  type CommunityReviewsResponse,
} from "@cineconnect/shared";
import { getApiBaseUrl } from "@/lib/runtimeConfig";

const API_BASE = getApiBaseUrl();

async function fetchLatestCommunityReviews(
  limit: number,
): Promise<CommunityReviewsResponse> {
  const res = await fetch(
    `${API_BASE}/api/films/community-reviews?limit=${limit}`,
  );
  if (!res.ok) {
    throw new Error("Erreur chargement des avis de la communauté");
  }
  const raw = await res.json();
  const parsed = communityReviewsResponseSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[useLatestCommunityReviews] Réponse invalide:", parsed.error);
    throw new Error("Réponse API invalide");
  }
  return parsed.data;
}

export function useLatestCommunityReviews(limit = 4) {
  return useQuery({
    queryKey: ["reviews", "community", limit],
    queryFn: () => fetchLatestCommunityReviews(limit),
    staleTime: 1000 * 60 * 2,
  });
}
