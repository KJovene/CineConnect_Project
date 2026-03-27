import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useAcceptFriendRequest,
  useFriends,
  usePendingRequests,
  useRejectFriendRequest,
  useRemoveFriend,
  useSearchUsers,
  useSendFriendRequest,
} from "@/hooks/useFriends";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";
import { apiClient } from "@/lib/apiClient";

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("useFriends hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useFriends returns parsed friend relations", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([
      {
        friend_id: 1,
        user_id: 2,
        friend_user_id: 3,
        status: "accepted",
        created_at: "2026-03-27T10:00:00.000Z",
        friend: {
          id: 3,
          name: "Bob",
          email: "bob@example.com",
          image: null,
        },
      },
    ]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFriends(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/friends");
    expect(result.current.data?.[0].friend?.name).toBe("Bob");
  });

  it("useFriends throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ invalid: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useFriends(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("usePendingRequests returns parsed pending requests", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([
      {
        friend_id: 5,
        user_id: 9,
        friend_user_id: 2,
        status: "pending",
        created_at: "2026-03-27T10:00:00.000Z",
        requester: {
          id: 9,
          name: "Alice",
          email: "alice@example.com",
          image: null,
        },
      },
    ]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => usePendingRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/friends/pending");
  });

  it("usePendingRequests throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => usePendingRequests(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("useSearchUsers is disabled when search is too short", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useSearchUsers("a"), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("useSearchUsers returns parsed users when enabled", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([
      {
        id: 3,
        name: "Eve",
        email: "eve@example.com",
        image: null,
        relationStatus: "accepted",
      },
    ]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchUsers("ev"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/users?search=ev");
  });

  it("useSearchUsers throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useSearchUsers("john"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("send/accept/reject/remove mutations call API and invalidate expected queries", async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ ok: true });
    (apiClient.delete as jest.Mock).mockResolvedValue({ ok: true });

    const client = createTestQueryClient();
    const invalidateSpy = jest.spyOn(client, "invalidateQueries");
    const wrapper = createQueryClientWrapper(client);

    const { result: sendHook } = renderHook(() => useSendFriendRequest(), {
      wrapper,
    });
    const { result: acceptHook } = renderHook(() => useAcceptFriendRequest(), {
      wrapper,
    });
    const { result: rejectHook } = renderHook(() => useRejectFriendRequest(), {
      wrapper,
    });
    const { result: removeHook } = renderHook(() => useRemoveFriend(), {
      wrapper,
    });

    await act(async () => {
      await sendHook.current.mutateAsync(7);
      await acceptHook.current.mutateAsync(8);
      await rejectHook.current.mutateAsync(9);
      await removeHook.current.mutateAsync(10);
    });

    expect(apiClient.post).toHaveBeenCalledWith("/friends/request", {
      friendUserId: 7,
    });
    expect(apiClient.post).toHaveBeenCalledWith("/friends/accept", {
      friendUserId: 8,
    });
    expect(apiClient.post).toHaveBeenCalledWith("/friends/reject", {
      friendUserId: 9,
    });
    expect(apiClient.delete).toHaveBeenCalledWith("/friends/10");

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["friends"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["users", "search"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["friends", "pending"],
    });
  });
});
