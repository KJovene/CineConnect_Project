import { renderHook, waitFor } from "@testing-library/react";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/__tests__/test-utils";

describe("useMovieDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  it("does not fetch when omdbId is empty", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useMovieDetails(""), { wrapper });

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("fetches details with credentials include", async () => {
    const payload = {
      film: { omdbId: "tt0133093", title: "Matrix" },
      reviews: [],
    };

    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(payload),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt0133093"), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/films/tt0133093",
      { credentials: "include" },
    );
    expect(result.current.data).toEqual(payload);
  });

  it("uses API error message when backend returns one", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "Not found" }),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Not found");
  });

  it("uses fallback message when backend error has no message", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Film introuvable");
  });

  it("uses fallback message when backend error body parsing fails", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMovieDetails("tt404"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe("Film introuvable");
  });
});
