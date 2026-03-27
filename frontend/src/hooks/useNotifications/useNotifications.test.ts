import { act, renderHook, waitFor } from "@testing-library/react";
import { useNotificationsFeed } from "@/hooks/useNotifications";
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from "@/utils/test-utils";
import { apiClient } from "@/lib/apiClient";
import { useSession } from "@/lib/auth-client";
import { usePendingRequests } from "@/hooks/useFriends";

jest.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

jest.mock("@/lib/auth-client", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/useFriends", () => ({
  usePendingRequests: jest.fn(),
}));

describe("useNotificationsFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("aggregates friend/message/reply notifications and sorts by date", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
    });

    (usePendingRequests as jest.Mock).mockReturnValue({
      data: [
        {
          friend_id: 101,
          created_at: "2026-03-27T08:00:00.000Z",
          requester: {
            name: "Alice",
            email: "alice@example.com",
          },
        },
      ],
    });

    (apiClient.get as jest.Mock).mockImplementation((path: string) => {
      if (path.includes("/messages/incoming")) {
        return Promise.resolve([
          {
            message_id: 201,
            sender_id: 2,
            sender_name: "Bob",
            sender_image: null,
            content: "hello from Bob",
            sent_at: "2026-03-27T10:00:00.000Z",
          },
        ]);
      }
      return Promise.resolve([
        {
          replyReviewId: 301,
          parentReviewId: 401,
          omdbId: "tt0133093",
          filmTitle: "Matrix",
          replier: {
            id: 3,
            name: "Eve",
            image: null,
          },
          comment: "nice review",
          createdAt: "2026-03-27T09:00:00.000Z",
        },
      ]);
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useNotificationsFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(3);
    });

    expect(result.current.notifications[0].id).toBe("message-201");
    expect(result.current.notifications[1].id).toBe("comment-reply-301");
    expect(result.current.notifications[2].id).toBe("friend-request-101");
    expect(result.current.unreadCount).toBe(3);
  });

  it("markAsRead and markAllAsRead update unread count and persist ids", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
    });

    (usePendingRequests as jest.Mock).mockReturnValue({
      data: [
        {
          friend_id: 10,
          created_at: "2026-03-27T10:00:00.000Z",
          requester: { name: "Alice", email: "alice@example.com" },
        },
      ],
    });

    (apiClient.get as jest.Mock).mockResolvedValue([]);

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useNotificationsFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    expect(result.current.unreadCount).toBe(1);

    act(() => {
      result.current.markAsRead("friend-request-10");
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(0);
    });

    act(() => {
      result.current.markAllAsRead();
    });

    const stored = localStorage.getItem("cineconnect:notifications:read:1");
    expect(stored).toContain("friend-request-10");
  });

  it("does not persist read notifications when session user is missing", async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    (usePendingRequests as jest.Mock).mockReturnValue({ data: [] });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useNotificationsFeed(), { wrapper });

    act(() => {
      result.current.markAsRead("message-1");
      result.current.markAllAsRead();
    });

    expect(localStorage.length).toBe(0);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("handles malformed storage and applies fallback labels and truncation", async () => {
    localStorage.setItem("cineconnect:notifications:read:1", "{bad json");

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
    });

    (usePendingRequests as jest.Mock).mockReturnValue({
      data: [
        {
          friend_id: 201,
          created_at: null,
          requester: null,
        },
      ],
    });

    (apiClient.get as jest.Mock).mockImplementation((path: string) => {
      if (path.includes("/messages/incoming")) {
        return Promise.resolve([
          {
            message_id: 300,
            sender_id: 2,
            sender_name: null,
            sender_image: null,
            content: "x".repeat(120),
            sent_at: "invalid-date",
          },
        ]);
      }

      return Promise.resolve([
        {
          replyReviewId: 400,
          parentReviewId: 500,
          omdbId: "tt1",
          filmTitle: "Film",
          replier: {
            id: 3,
            name: "Eve",
            image: null,
          },
          comment: "y".repeat(120),
          createdAt: null,
        },
      ]);
    });

    const client = createTestQueryClient();
    const wrapper = createQueryClientWrapper(client);

    const { result } = renderHook(() => useNotificationsFeed(), { wrapper });

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(3);
    });

    const friendRequest = result.current.notifications.find(
      (n) => n.id === "friend-request-201",
    );
    const messageNotification = result.current.notifications.find(
      (n) => n.id === "message-300",
    );
    const replyNotification = result.current.notifications.find(
      (n) => n.id === "comment-reply-400",
    );

    expect(friendRequest?.description).toContain("Un utilisateur");
    expect(messageNotification?.title).toContain("un ami");
    expect(messageNotification?.description.endsWith("...")).toBe(true);
    expect(replyNotification?.description.endsWith("...")).toBe(true);
  });
});
