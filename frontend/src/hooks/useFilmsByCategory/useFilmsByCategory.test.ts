import { renderHook, waitFor } from "@testing-library/react";
import { useFilmsByCategory } from "@/hooks/useFilmsByCategory";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";

describe("useFilmsByCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  it("returns category sections when response is valid", async () => {
    const payload = [
      {
        category: {
          category_id: 1,
          name: "Action",
          description: null,
        },
        films: [
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
        ],
      },
    ];

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByCategory(6), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/categories/films?limit=6",
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

    const { result } = renderHook(() => useFilmsByCategory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement des films par catégorie",
    );
  });

  it("throws schema error when payload is invalid", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ bad: true }),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByCategory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });
});
