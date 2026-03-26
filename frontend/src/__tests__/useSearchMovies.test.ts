import { renderHook, waitFor } from "@testing-library/react";
import { useSearchMovies } from "@/hooks/useSearchMovies";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/__tests__/test-utils";

describe("useSearchMovies", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  it("does not fetch when query has less than 3 characters", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useSearchMovies("ab", 1), { wrapper });

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("does not fetch when query is empty", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useSearchMovies("", 1), { wrapper });

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("fetches movies when query is valid", async () => {
    const payload = {
      films: [{ id: 1, title: "Matrix" }],
      page: 1,
      totalPages: 1,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("matrix", 2), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/search?q=matrix&page=2",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("uses default page when not provided", async () => {
    const payload = {
      films: [{ id: 2, title: "Inception" }],
      page: 1,
      totalPages: 1,
    };

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchMovies("inception"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/search?q=inception&page=1",
    );
    expect(result.current.data).toEqual(payload);
  });

  it("uses API error message when search fails", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Boom" }),
    });

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
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

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
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
    });

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
});
