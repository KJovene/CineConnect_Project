import { renderHook, waitFor } from "@testing-library/react";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
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

describe("useTopRatedMovies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches top-rated movies", async () => {
    const payload = [
      {
        film_id: 1,
        omdb_id: "tt0133093",
        title: "Matrix",
        year: 1999,
        type: "movie",
        director: "Lana Wachowski, Lilly Wachowski",
        poster_url: "https://images.example.com/matrix.jpg",
        genre: "Action, Sci-Fi",
        plot: "A hacker discovers reality is a simulation.",
        runtime: "136 min",
        omdb_rating: "8.7",
        average_rating: 4.5,
        ratings_count: 12,
        awards: "Won 4 Oscars. 42 wins & 51 nominations total",
        created_at: "2026-03-27T10:00:00.000Z",
        updated_at: "2026-03-27T10:00:00.000Z",
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue(payload);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useTopRatedMovies(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/films/top-rated?limit=5");
    expect(result.current.data).toEqual(payload);
  });

  it("throws expected error when response is not ok", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 500"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useTopRatedMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement homepage",
    );
  });

  it("throws schema error when payload is invalid", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ films: [] });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useTopRatedMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });
});
