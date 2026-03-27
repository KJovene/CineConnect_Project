import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useCreateFilmComment,
  useCreateFilmReply,
  useDeleteFilmComment,
  useFilmRatingSummary,
  useFilmReviews,
  useMyLatestComments,
  useMyLatestRatings,
  useUpdateFilmComment,
  useUpsertFilmRating,
} from "@/hooks/useReviews";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";
import { apiClient } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("useReviews hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useMyLatestRatings returns parsed ratings", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([
      {
        reviewId: 1,
        filmId: 2,
        omdbId: "tt0133093",
        filmTitle: "Matrix",
        posterUrl: null,
        rating: 5,
        createdAt: "2026-03-27T10:00:00.000Z",
      },
    ]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);
    const { result } = renderHook(() => useMyLatestRatings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/users/me/latest-ratings?limit=100",
    );
  });

  it("useMyLatestRatings throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);
    const { result } = renderHook(() => useMyLatestRatings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("useMyLatestComments throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);
    const { result } = renderHook(() => useMyLatestComments(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("useFilmReviews is disabled without omdbId", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useFilmReviews(""), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("useFilmReviews and useFilmRatingSummary return parsed data", async () => {
    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce([
        {
          reviewId: 10,
          filmId: 2,
          parentReviewId: null,
          rating: 4,
          comment: "great",
          createdAt: "2026-03-27T10:00:00.000Z",
          updatedAt: "2026-03-27T10:00:00.000Z",
          author: { id: 1, name: "Alice", image: null },
          replies: [
            {
              reviewId: 11,
              filmId: 2,
              parentReviewId: 10,
              rating: 0,
              comment: "agree",
              createdAt: "2026-03-27T11:00:00.000Z",
              updatedAt: "2026-03-27T11:00:00.000Z",
              author: { id: 2, name: "Bob", image: null },
            },
          ],
        },
      ])
      .mockResolvedValueOnce({
        averageRating: 4.2,
        totalRatings: 5,
        userRating: 4,
      });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result: reviewsResult } = renderHook(
      () => useFilmReviews("tt0133093"),
      {
        wrapper,
      },
    );
    const { result: summaryResult } = renderHook(
      () => useFilmRatingSummary("tt0133093"),
      { wrapper },
    );

    await waitFor(() => {
      expect(reviewsResult.current.isSuccess).toBe(true);
      expect(summaryResult.current.isSuccess).toBe(true);
    });

    expect(reviewsResult.current.data?.[0].replies[0].comment).toBe("agree");
    expect(summaryResult.current.data?.averageRating).toBe(4.2);
  });

  it("useFilmReviews throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmReviews("tt0133093"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("useFilmRatingSummary throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ averageRating: "bad" });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmRatingSummary("tt0133093"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("mutation hooks call API and invalidate related queries", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ ok: true });
    (apiClient.patch as jest.Mock).mockResolvedValue({ ok: true });
    (apiClient.delete as jest.Mock).mockResolvedValue({ ok: true });

    const client = createTestQueryClient();
    const invalidateSpy = jest.spyOn(client, "invalidateQueries");
    const wrapper = createQueryClientWrapper(client);

    const { result: upsert } = renderHook(
      () => useUpsertFilmRating("tt0133093"),
      {
        wrapper,
      },
    );
    const { result: createComment } = renderHook(
      () => useCreateFilmComment("tt0133093"),
      { wrapper },
    );
    const { result: updateComment } = renderHook(
      () => useUpdateFilmComment("tt0133093"),
      { wrapper },
    );
    const { result: deleteComment } = renderHook(
      () => useDeleteFilmComment("tt0133093"),
      { wrapper },
    );
    const { result: createReply } = renderHook(
      () => useCreateFilmReply("tt0133093"),
      {
        wrapper,
      },
    );

    await act(async () => {
      await upsert.current.mutateAsync({ rating: 5 });
      await createComment.current.mutateAsync({ comment: "nice", rating: 5 });
      await updateComment.current.mutateAsync({
        reviewId: 10,
        payload: { comment: "edited" },
      });
      await deleteComment.current.mutateAsync(10);
      await createReply.current.mutateAsync({
        reviewId: 10,
        payload: { comment: "reply" },
      });
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/films/tt0133093/reviews/rating",
      {
        rating: 5,
      },
    );
    expect(apiClient.post).toHaveBeenCalledWith("/films/tt0133093/reviews", {
      comment: "nice",
      rating: 5,
    });
    expect(apiClient.patch).toHaveBeenCalledWith(
      "/films/tt0133093/reviews/10",
      {
        comment: "edited",
      },
    );
    expect(apiClient.delete).toHaveBeenCalledWith(
      "/films/tt0133093/reviews/10",
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      "/films/tt0133093/reviews/10/replies",
      { comment: "reply" },
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["films", "tt0133093", "reviews"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["films", "tt0133093", "rating-summary"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["movies", "detail", "tt0133093"],
    });
  });
});
