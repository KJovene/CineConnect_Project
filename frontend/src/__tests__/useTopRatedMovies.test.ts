import { renderHook, waitFor } from "@testing-library/react";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
import { createQueryClientWrapper, createTestQueryClient } from "@/__tests__/test-utils";

describe("useTopRatedMovies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("fetches top-rated movies", async () => {
    const payload = { films: [{ id: 1, title: "Movie" }] };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useTopRatedMovies(5), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/top-rated?limit=5",
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

    const { result } = renderHook(() => useTopRatedMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Erreur chargement homepage");
  });
});
