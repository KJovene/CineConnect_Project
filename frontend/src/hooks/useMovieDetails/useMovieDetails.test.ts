import { renderHook, waitFor } from "@testing-library/react";
import { useMovieDetails } from "@/hooks/useMovieDetails";
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

describe("useMovieDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not fetch when omdbId is empty", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useMovieDetails(""), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("fetches details", async () => {
    const payload = {
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
      user_rating: null,
    };

    (apiClient.get as jest.Mock).mockResolvedValue(payload);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt0133093"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/films/tt0133093");
    expect(result.current.data).toEqual(payload);
  });

  it("uses API error message when backend returns one", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("Not found"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Not found");
  });

  it("uses fallback message when backend error has no message", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 404"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Film introuvable");
  });

  it("uses fallback message when backend error body parsing fails", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 404"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Film introuvable");
  });

  it("throws schema error when payload is invalid", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ film: { id: 1 } });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt0133093"), {
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
