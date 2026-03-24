import React, { useEffect, useState } from "react";
import { HiChatBubbleLeftRight, HiArrowLeft, HiChevronLeft, HiChevronRight } from "react-icons/hi2";
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
  // "list" | "chat" — contrôle la vue active sur mobile
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(
    selectedFriend?.id ?? null,
  );
  const socketSend = useSocketSend();

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
    setMobileView("chat");
  }, [friends, search.friendId]);

  useIncomingMessages(currentUserId);

  const handleSend = (content: string) => {
    if (!selectedFriend || !currentUserId) return;
    socketSend(selectedFriend.id, content);
  };

  const handleSelectFriend = (friend: FriendUser) => {
    setSelectedFriend(friend);
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
        {/* Header sidebar */}
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
            {sidebarCollapsed ? <HiChevronRight size={18} /> : <HiChevronLeft size={18} />}
          </button>
        </div>

        {/* Liste */}
        <div
          className="flex-1 overflow-y-auto no-scrollbar transition-opacity duration-200"
          style={{ opacity: sidebarCollapsed ? 0 : 1, pointerEvents: sidebarCollapsed ? "none" : "auto" }}
        >
          <ConversationList
            friends={friends}
            isLoading={friendsLoading}
            selectedId={selectedFriend?.id ?? null}
            onSelect={handleSelectFriend}
          />
        </div>
      </aside>

      {/* Bouton retour mobile — toujours dans le flux, jamais caché avec main */}
      {selectedFriend && mobileView === "chat" && (
        <div
          className="lg:hidden fixed top-20 left-0 right-0 z-10 flex items-center gap-3 px-4 shrink-0"
          style={{
            height: "3.5rem",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <HiArrowLeft size={20} />
          </button>
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            {selectedFriend.name}
          </span>
        </div>
      )}

      {/* fenêtre de chat */}
      <main
        className={`
          flex-1 overflow-hidden flex flex-col
          ${mobileView === "list" ? "hidden lg:flex" : "flex"}
          ${selectedFriend && mobileView === "chat" ? "lg:pt-0 pt-14" : ""}
        `}
      >
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
            <p className="text-sm">Sélectionnez un ami pour commencer à discuter</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Discussion;