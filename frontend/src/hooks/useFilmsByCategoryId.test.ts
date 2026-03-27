import { renderHook, waitFor } from "@testing-library/react";
import { useFilmsByCategoryId } from "@/hooks/useFilmsByCategoryId";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";

describe("useFilmsByCategoryId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  it("returns films for a category id when response is valid", async () => {
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
        imdb_rating: "8.7",
        average_rating: 4.5,
        ratings_count: 12,
        awards: "Won 4 Oscars. 42 wins & 51 nominations total",
        created_at: "2026-03-27T10:00:00.000Z",
        updated_at: "2026-03-27T10:00:00.000Z",
      },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByCategoryId(4, 10), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/categories/4/films?limit=10",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("throws expected error when response is not ok", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByCategoryId(2), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement des films de la catégorie",
    );
  });

  it("throws schema error when payload is invalid", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ bad: true }),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByCategoryId(2), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });
});
