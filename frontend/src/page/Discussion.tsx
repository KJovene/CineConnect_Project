import React, { useEffect, useState } from "react";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { useSearch } from "@tanstack/react-router";
import { ChatWindow } from "@/components/organisms";
import { ConversationList } from "@/components/molecules";
import { useSession } from "@/lib/auth-client";
import { useFriends, type FriendUser } from "@/features/friends/hooks";
import {
  useMessages,
  useIncomingMessages,
  useSocketSend,
} from "@/features/messages/hooks";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const Discussion: React.FC = () => {
  const search = useSearch({ from: "/_authenticated/discussion" });
  const { data: session } = useSession();
  const currentUserId = session?.user ? parseInt(session.user.id) : null;

  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(
    selectedFriend?.id ?? null,
  );
  const socketSend = useSocketSend();

  // Connexion socket au montage, déconnexion au démontage
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    const rawFriendId = search.friendId;
    if (!rawFriendId) return;

    const parsedFriendId = Number.parseInt(rawFriendId, 10);
    if (Number.isNaN(parsedFriendId)) return;

    const relation = friends.find((item) => item.friend?.id === parsedFriendId);
    const targetFriend = relation?.friend;
    if (!targetFriend) return;
    setSelectedFriend(targetFriend);
  }, [friends, search.friendId]);

  // Écoute les messages entrants et met à jour le cache TanStack Query
  useIncomingMessages(currentUserId);

  const handleSend = (content: string) => {
    if (!selectedFriend || !currentUserId) return;
    // Envoi via socket (temps réel) — le hook useIncomingMessages met à jour le cache
    socketSend(selectedFriend.id, content);
  };

  return (
    <div className="flex h-full pt-20">

      {/* Panel gauche */}
      <aside
        className="w-72 shrink-0 flex flex-col"
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ConversationList
            friends={friends}
            isLoading={friendsLoading}
            selectedId={selectedFriend?.id ?? null}
            onSelect={setSelectedFriend}
          />
        </div>
      </aside>

      {/* Panel droit */}
      <main className="flex-1 overflow-hidden">
        {selectedFriend && currentUserId ? (
          <ChatWindow
            friend={selectedFriend}
            messages={messages}
            currentUserId={currentUserId}
            isLoading={messagesLoading}
            onSend={handleSend}
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: "var(--color-text-muted)" }}
          >
            <HiChatBubbleLeftRight size={48} className="mb-4 opacity-20" />
            <p className="text-sm">
              Sélectionnez un ami pour commencer à discuter
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discussion;