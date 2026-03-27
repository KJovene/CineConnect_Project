import React, { useEffect, useMemo, useState } from "react";
import {
  HiChatBubbleLeftRight,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { useSearch } from "@tanstack/react-router";
import { ChatWindow } from "@/components/organisms";
import { ConversationList } from "@/components/molecules";
import { useSession } from "@/lib/auth-client";
import { useFriends, type FriendUser } from "@/hooks/useFriends";
import {
  useMessages,
  useIncomingMessages,
  useSocketSend,
} from "@/hooks/useMessages";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const Discussion: React.FC = () => {
  const search = useSearch({ from: "/_authenticated/discussion" });
  const { data: session } = useSession();
  const currentUserId = session?.user
    ? Number.parseInt(session.user.id, 10)
    : null;

  const parsedSearchFriendId = useMemo(() => {
    const rawFriendId = search.friendId;
    if (!rawFriendId) return null;
    const parsedFriendId = Number.parseInt(rawFriendId, 10);
    return Number.isNaN(parsedFriendId) ? null : parsedFriendId;
  }, [search.friendId]);

  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  // Controle la vue active sur mobile
  const [mobileView, setMobileView] = useState<"list" | "chat">(
    parsedSearchFriendId ? "chat" : "list",
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const activeFriendId = selectedFriendId ?? parsedSearchFriendId;
  const activeFriend = useMemo(() => {
    if (!activeFriendId) return null;
    const relation = friends.find((item) => item.friend?.id === activeFriendId);
    return relation?.friend ?? null;
  }, [friends, activeFriendId]);

  const { data: messages = [], isLoading: messagesLoading } = useMessages(
    activeFriend?.id ?? null,
  );
  const socketSend = useSocketSend();

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  useIncomingMessages(currentUserId);

  const handleSend = (content: string) => {
    if (!activeFriend || !currentUserId) return;
    socketSend(activeFriend.id, content);
  };

  const handleSelectFriend = (friend: FriendUser) => {
    setSelectedFriendId(friend.id);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  return (
    <div className="flex h-full pt-20">
      {/* liste des conversations */}
      <aside
        className={`
          shrink-0 flex flex-col overflow-hidden
          transition-[width] duration-200 ease-in-out
          w-full ${sidebarCollapsed ? "lg:w-14" : "lg:w-72"}
          ${mobileView === "chat" ? "hidden lg:flex" : "flex"}
        `}
        style={{
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* En-tete de la barre laterale */}
        <div
          className="h-16 flex items-center justify-between shrink-0 px-3 gap-2"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2
            className="text-sm font-semibold whitespace-nowrap overflow-hidden transition-opacity duration-200"
            style={{
              color: "var(--color-text)",
              opacity: sidebarCollapsed ? 0 : 1,
              maxWidth: sidebarCollapsed ? 0 : "100%",
            }}
          >
            Messages
          </h2>
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="hidden lg:flex shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
            title={sidebarCollapsed ? "Ouvrir la liste" : "Réduire la liste"}
          >
            {sidebarCollapsed ? (
              <HiChevronRight size={18} />
            ) : (
              <HiChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Liste */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar transition-opacity duration-200"
          style={{
            opacity: sidebarCollapsed ? 0 : 1,
            pointerEvents: sidebarCollapsed ? "none" : "auto",
          }}
        >
          <ConversationList
            friends={friends}
            isLoading={friendsLoading}
            selectedId={activeFriend?.id ?? null}
            onSelect={handleSelectFriend}
          />
        </div>
      </aside>

      {/* Fenêtre de chat */}
      <main
        className={`
          flex-1 overflow-hidden flex flex-col
          ${mobileView === "list" ? "hidden lg:flex" : "flex"}
        `}
      >
        {activeFriend && currentUserId ? (
          <ChatWindow
            friend={activeFriend}
            messages={messages}
            currentUserId={currentUserId}
            isLoading={messagesLoading}
            onSend={handleSend}
            onBack={handleBack}
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
