import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { Avatar } from '@/components/atoms';
import type { FriendRelation, FriendUser } from '@/features/friends/hooks';

export interface ConversationListProps {
  friends: FriendRelation[];
  isLoading?: boolean;
  selectedId?: number | null;
  onSelect: (friend: FriendUser) => void;
}

export function ConversationList({
  friends,
  isLoading,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1 px-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-neutral-600 px-4 py-10">
        <HiChatBubbleLeftRight size={28} className="mb-2 opacity-30" />
        <p className="text-xs text-center">Ajoutez des amis pour commencer à discuter</p>
      </div>
    );
  }

  return (
    <div className="py-1">
      {friends.map((rel) => {
        const friend = rel.friend as FriendUser | null;
        if (!friend) return null;
        const isSelected = selectedId === friend.id;

        return (
          <button
            key={rel.friend_id}
            onClick={() => onSelect(friend)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
              isSelected
                ? 'bg-white/5 border-r-2 border-indigo-500'
                : 'hover:bg-white/[0.03] border-r-2 border-transparent'
            }`}
          >
            <Avatar image={friend.image} name={friend.name} size="md" />
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {friend.name ?? 'Utilisateur'}
              </div>
              <div className="text-[11px] text-neutral-500 truncate">{friend.email}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
