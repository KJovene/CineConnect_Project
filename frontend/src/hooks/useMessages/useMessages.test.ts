import { renderHook, waitFor } from "@testing-library/react";
import {
  useIncomingMessages,
  useMessages,
  useSocketSend,
} from "@/hooks/useMessages";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";
import { apiClient } from "@/lib/apiClient";
import { getSocket } from "@/lib/socket";

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock("@/lib/socket", () => ({
  getSocket: jest.fn(),
}));

describe("useMessages hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("useMessages is disabled when withUserId is null", () => {
    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useMessages(null), { wrapper });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("useMessages returns parsed messages", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([
      {
        message_id: 1,
        sender_id: 2,
        receiver_id: 3,
        content: "hello",
        sent_at: "2026-03-27T10:00:00.000Z",
      },
    ]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMessages(3), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.get).toHaveBeenCalledWith("/messages/with/3");
    expect(result.current.data?.[0].content).toBe("hello");
  });

  it("useMessages throws on invalid payload", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([{ bad: true }]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useMessages(3), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect((result.current.error as Error).message).toBe(
      "Réponse API invalide",
    );
  });

  it("useSocketSend emits dm:send through socket", () => {
    const emit = jest.fn();
    (getSocket as jest.Mock).mockReturnValue({ emit });

    const { result } = renderHook(() => useSocketSend());

    result.current(42, "yo");

    expect(emit).toHaveBeenCalledWith("dm:send", {
      toUserId: 42,
      content: "yo",
    });
  });

  it("useIncomingMessages subscribes and updates query cache on valid socket message", () => {
    const on = jest.fn();
    const off = jest.fn();
    (getSocket as jest.Mock).mockReturnValue({ on, off });

    const client = createTestQueryClient();
    client.setQueryData(["messages", 2], []);
    const wrapper = createQueryClientWrapper(client);

    const { unmount } = renderHook(() => useIncomingMessages(1), { wrapper });

    const handler = on.mock.calls[0][1] as (payload: {
      message: unknown;
    }) => void;
    handler({
      message: {
        message_id: 99,
        sender_id: 2,
        receiver_id: 1,
        content: "new",
        sent_at: "2026-03-27T10:00:00.000Z",
      },
    });

    const cached = client.getQueryData(["messages", 2]) as Array<{
      content: string;
    }>;
    expect(cached).toHaveLength(1);
    expect(cached[0].content).toBe("new");

    unmount();
    expect(off).toHaveBeenCalledWith("dm:new", handler);
  });

  it("useIncomingMessages uses receiver_id when current user is sender", () => {
    const on = jest.fn();
    const off = jest.fn();
    (getSocket as jest.Mock).mockReturnValue({ on, off });

    const client = createTestQueryClient();
    client.setQueryData(["messages", 9], []);
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useIncomingMessages(1), { wrapper });

    const handler = on.mock.calls[0][1] as (payload: {
      message: unknown;
    }) => void;
    handler({
      message: {
        message_id: 100,
        sender_id: 1,
        receiver_id: 9,
        content: "outgoing",
        sent_at: "2026-03-27T10:00:00.000Z",
      },
    });

    const cached = client.getQueryData(["messages", 9]) as Array<{
      content: string;
    }>;
    expect(cached[0].content).toBe("outgoing");
  });

  it("useIncomingMessages does not subscribe when currentUserId is null", () => {
    const on = jest.fn();
    const off = jest.fn();
    (getSocket as jest.Mock).mockReturnValue({ on, off });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useIncomingMessages(null), { wrapper });

    expect(getSocket).not.toHaveBeenCalled();
    expect(on).not.toHaveBeenCalled();
  });

  it("useIncomingMessages ignores invalid socket payload", () => {
    const on = jest.fn();
    const off = jest.fn();
    (getSocket as jest.Mock).mockReturnValue({ on, off });

    const client = createTestQueryClient();
    client.setQueryData(["messages", 2], []);
    const wrapper = createQueryClientWrapper(client);

    renderHook(() => useIncomingMessages(1), { wrapper });

    const handler = on.mock.calls[0][1] as (payload: {
      message: unknown;
    }) => void;
    handler({ message: { bad: true } });

    const cached = client.getQueryData(["messages", 2]) as Array<unknown>;
    expect(cached).toEqual([]);
  });
});
