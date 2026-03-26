import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/apiClient";
import { usePendingRequests } from "@/hooks/useFriends";

export type AppNotificationType =
  | "friend-request"
  | "message"
  | "comment-reply";

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  description: string;
  createdAt: string | null;
  isRead: boolean;
  target:
    | { kind: "friend-request" }
    | { kind: "message"; friendId: number }
    | { kind: "comment-reply"; omdbId: string; parentReviewId: number };
}

interface IncomingMessageNotification {
  message_id: number;
  sender_id: number;
  sender_name: string | null;
  sender_image: string | null;
  content: string;
  sent_at: string | null;
}

interface CommentReplyNotification {
  replyReviewId: number;
  parentReviewId: number;
  omdbId: string;
  filmTitle: string;
  replier: {
    id: number;
    name: string;
    image: string | null;
  };
  comment: string;
  createdAt: string | null;
}

function toTimestamp(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function readStorage(userId: string): string[] {
  try {
    const raw = localStorage.getItem(
      `cineconnect:notifications:read:${userId}`,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStorage(userId: string, ids: string[]): void {
  localStorage.setItem(
    `cineconnect:notifications:read:${userId}`,
    JSON.stringify(ids),
  );
}

export function useNotificationsFeed() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const { data: pendingRequests = [] } = usePendingRequests();

  const { data: incomingMessages = [] } = useQuery({
    queryKey: ["messages", "incoming", "notifications"],
    queryFn: () =>
      apiClient.get<IncomingMessageNotification[]>(
        "/messages/incoming?limit=30",
      ),
    enabled: !!userId,
    refetchInterval: 15000,
  });

  const { data: commentReplies = [] } = useQuery({
    queryKey: ["users", "me", "comment-replies", "notifications"],
    queryFn: () =>
      apiClient.get<CommentReplyNotification[]>(
        "/users/me/comment-replies?limit=30",
      ),
    enabled: !!userId,
    refetchInterval: 20000,
  });

  const [sessionReadIds, setSessionReadIds] = useState<string[]>([]);

  const persistedReadIds = useMemo(
    () => (userId ? readStorage(userId) : []),
    [userId],
  );

  const readSet = useMemo(
    () => new Set([...persistedReadIds, ...sessionReadIds]),
    [persistedReadIds, sessionReadIds],
  );

  const notifications = useMemo<AppNotification[]>(() => {
    const friendItems: AppNotification[] = pendingRequests.map((request) => ({
      id: `friend-request-${request.friend_id}`,
      type: "friend-request",
      title: "Nouvelle demande d'ami",
      description: `${
        request.requester?.name ?? request.requester?.email ?? "Un utilisateur"
      } vous a envoyé une demande d'ami.`,
      createdAt: request.created_at,
      isRead: readSet.has(`friend-request-${request.friend_id}`),
      target: { kind: "friend-request" },
    }));

    const messageItems: AppNotification[] = incomingMessages.map((message) => ({
      id: `message-${message.message_id}`,
      type: "message",
      title: `Nouveau message de ${message.sender_name ?? "un ami"}`,
      description:
        message.content.length > 90
          ? `${message.content.slice(0, 87)}...`
          : message.content,
      createdAt: message.sent_at,
      isRead: readSet.has(`message-${message.message_id}`),
      target: { kind: "message", friendId: message.sender_id },
    }));

    const replyItems: AppNotification[] = commentReplies.map((reply) => ({
      id: `comment-reply-${reply.replyReviewId}`,
      type: "comment-reply",
      title: `${reply.replier.name} a répondu à votre commentaire`,
      description: `${reply.filmTitle} - ${
        reply.comment.length > 90
          ? `${reply.comment.slice(0, 87)}...`
          : reply.comment
      }`,
      createdAt: reply.createdAt,
      isRead: readSet.has(`comment-reply-${reply.replyReviewId}`),
      target: {
        kind: "comment-reply",
        omdbId: reply.omdbId,
        parentReviewId: reply.parentReviewId,
      },
    }));

    return [...friendItems, ...messageItems, ...replyItems].sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt),
    );
  }, [commentReplies, incomingMessages, pendingRequests, readSet]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const markAsRead = (id: string) => {
    if (!userId) return;

    setSessionReadIds((previous) => {
      if (previous.includes(id)) return previous;
      const merged = Array.from(
        new Set([...persistedReadIds, ...previous, id]),
      );
      writeStorage(userId, merged);
      return [...previous, id];
    });
  };

  const markAllAsRead = () => {
    if (!userId) return;
    const ids = notifications.map((item) => item.id);
    writeStorage(userId, ids);
    setSessionReadIds(ids);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
