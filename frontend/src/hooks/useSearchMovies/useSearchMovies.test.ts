import { renderHook, waitFor } from "@testing-library/react";
import { useSearchMovies } from "@/hooks/useSearchMovies";
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

describe("useSearchMovies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not fetch when query has less than 3 characters", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useSearchMovies("ab", 1), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("does not fetch when query is empty", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useSearchMovies("", 1), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("fetches movies when query is valid", async () => {
    const payload = {
      results: [
        {
          omdb_id: "tt0133093",
          title: "Matrix",
          year: 1999,
          type: "movie",
          poster_url: "https://images.example.com/matrix.jpg",
        },
      ],
      page: 1,
      totalResults: 1,
    };

    (apiClient.get as jest.Mock).mockResolvedValue(payload);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 2), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/films/search?q=matrix&page=2");
    expect(result.current.data).toEqual(payload);
  });

  it("uses default page when not provided", async () => {
    const payload = {
      results: [
        {
          omdb_id: "tt1375666",
          title: "Inception",
          year: 2010,
          type: "movie",
          poster_url: "https://images.example.com/inception.jpg",
        },
      ],
      page: 1,
      totalResults: 1,
    };

    (apiClient.get as jest.Mock).mockResolvedValue(payload);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("inception"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      "/films/search?q=inception&page=1",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("uses API error message when search fails", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("Boom"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 1), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Boom");
  });

  it("uses fallback message when API error has no message", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 500"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 1), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Erreur de recherche");
  });

  it("uses fallback message when error body parsing fails", async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error("HTTP 500"));

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 1), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Erreur de recherche");
  });

  it("throws schema error when payload is invalid", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ films: [] });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 1), {
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
