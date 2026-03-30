import { renderHook, waitFor } from "@testing-library/react";
import { useLatestCommunityReviews } from "@/hooks/useLatestCommunityReviews";
import { apiClient } from "@/lib/apiClient";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe("useLatestCommunityReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches latest community reviews", async () => {
    const payload = [
      {
        reviewId: 1,
        rating: 5,
        comment: "Great",
        createdAt: "2026-03-27T10:00:00.000Z",
        author: {
          id: 10,
          name: "Alice",
          image: null,
        },
        film: {
          omdbId: "tt0133093",
          title: "Matrix",
        },
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue(payload);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useLatestCommunityReviews(6), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/films/community-reviews?limit=6",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("throws expected error when response is not ok", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 500"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useLatestCommunityReviews(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement des avis de la communauté",
    );
  });

  it("throws schema error when payload is invalid", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ reviews: [] });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useLatestCommunityReviews(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });
});
