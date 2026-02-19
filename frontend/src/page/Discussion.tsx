import React, { useEffect, useState } from 'react';
import {
  HiOutlineFilm,
  HiOutlinePlayCircle,
  HiOutlineUsers,
  HiOutlineChatBubbleLeftRight,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import { AppLayout } from '@/components/templates';
import { ChatWindow } from '@/components/organisms';
import type { SidebarNavSection } from '@/components/organisms';
import { ConversationList } from '@/components/molecules';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/lib/auth-client';
import { useFriends, type FriendUser } from '@/features/friends/hooks';
import { useMessages, useIncomingMessages, useSocketSend } from '@/features/messages/hooks';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const SIDEBAR_SECTIONS: SidebarNavSection[] = [
  {
    title: 'Exploration',
    items: [
      { id: 'discover', icon: <HiOutlineFilm size={20} />, label: 'Découvrir', href: '/' },
      { id: 'films', icon: <HiOutlineFilm size={20} />, label: 'Films', href: '/films' },
      { id: 'series', icon: <HiOutlinePlayCircle size={20} />, label: 'Séries', href: '/series' },
      { id: 'notes', icon: <HiOutlinePlayCircle size={20} />, label: 'Mes Notes', href: '/mes-notes' },
    ],
  },
  {
    title: 'Social',
    items: [
      { id: 'community', icon: <HiOutlineUsers size={20} />, label: 'Profil', href: '/profil' },
      {
        id: 'discussions',
        icon: <HiOutlineChatBubbleLeftRight size={20} />,
        label: 'Discussions',
        href: '/discussion',
        isActive: true,
      },
    ],
  },
];

const Discussion: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, handleLogout } = useAuth();
  const { data: session } = useSession();
  const currentUserId = session?.user ? parseInt(session.user.id) : null;

  const [selectedFriend, setSelectedFriend] = useState<FriendUser | null>(null);

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedFriend?.id ?? null);
  const socketSend = useSocketSend();

  // Connexion socket au montage, déconnexion au démontage
  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, []);

  // Écoute les messages entrants et met à jour le cache TanStack Query
  useIncomingMessages(currentUserId);

  const handleSend = (content: string) => {
    if (!selectedFriend || !currentUserId) return;
    // Envoi via socket (temps réel) — le hook useIncomingMessages met à jour le cache
    socketSend(selectedFriend.id, content);
  };

  const currentUser = session?.user;

  return (
    <AppLayout
      sidebarSections={SIDEBAR_SECTIONS}
      user={{
        name: currentUser?.name ?? 'Utilisateur',
        badge: 'Membre',
        avatar: currentUser?.image ?? `https://i.pravatar.cc/150?u=${currentUser?.id}`,
      }}
      isAuthenticated={isAuthenticated}
      isLoading={authLoading}
      onLogout={handleLogout}
    >
      <div className="flex h-full pt-20">
        {/* Panel gauche */}
        <aside className="w-72 shrink-0 border-r border-white/5 flex flex-col bg-[#080808]">
          <div className="px-4 py-4 border-b border-white/5 shrink-0">
            <h2 className="text-sm font-semibold text-white">Messages</h2>
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
            <div className="flex flex-col items-center justify-center h-full text-neutral-600">
              <HiChatBubbleLeftRight size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Sélectionnez un ami pour commencer à discuter</p>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
};

export default Discussion;
