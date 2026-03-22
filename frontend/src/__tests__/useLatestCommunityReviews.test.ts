import { renderHook, waitFor } from "@testing-library/react";
import { useLatestCommunityReviews } from "@/hooks/useLatestCommunityReviews";
import { createQueryClientWrapper, createTestQueryClient } from "@/__tests__/test-utils";

describe("useLatestCommunityReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches latest community reviews", async () => {
    const payload = { reviews: [{ id: 1, title: "Great" }] };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useLatestCommunityReviews(6), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/community-reviews?limit=6",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("throws expected error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useLatestCommunityReviews(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement des avis de la communauté",
    );
  });
});
