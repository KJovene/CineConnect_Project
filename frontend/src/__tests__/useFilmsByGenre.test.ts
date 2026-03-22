import { renderHook, waitFor } from "@testing-library/react";
import { useFilmsByGenre } from "@/hooks/useFilmsByGenre";
import { createQueryClientWrapper, createTestQueryClient } from "@/__tests__/test-utils";

describe("useFilmsByGenre", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches films by genre with provided limit", async () => {
    const payload = { genres: [{ genre: "Action", films: [] }] };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFilmsByGenre(12), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/by-genre?limit=12",
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

    const { result } = renderHook(() => useFilmsByGenre(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Erreur chargement des films par genre",
    );
  });
});
