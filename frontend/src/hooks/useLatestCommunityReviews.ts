import { useQuery } from "@tanstack/react-query";
import type { CommunityReviewsResponse } from "@cineconnect/shared";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function fetchLatestCommunityReviews(
  limit = 4,
): Promise<CommunityReviewsResponse> {
  const res = await fetch(
    `${API_BASE}/api/films/community-reviews?limit=${limit}`,
  );
  if (!res.ok) {
    throw new Error("Erreur chargement des avis de la communauté");
  }

  return res.json();
}

export function useLatestCommunityReviews(limit = 4) {
  return useQuery({
    queryKey: ["reviews", "community", limit],
    queryFn: () => fetchLatestCommunityReviews(limit),
    staleTime: 1000 * 60 * 2,
  });
}
