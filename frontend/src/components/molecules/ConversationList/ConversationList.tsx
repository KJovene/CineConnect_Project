import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { Avatar } from "@/components/atoms";
import type { FriendRelation, FriendUser } from "@/hooks/useFriends";

interface ConversationListProps {
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
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{ background: "var(--color-surface)" }}
          />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 px-4 py-10"
        style={{ color: "var(--color-text-muted)" }}
      >
        <HiChatBubbleLeftRight size={28} className="mb-2 opacity-30" />
        <p className="text-xs text-center">
          Ajoutez des amis pour commencer à discuter
        </p>
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
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-r-2 cursor-pointer ${
              isSelected
                ? "border-indigo-500"
                : "border-transparent hover:bg-white/3"
            }`}
            style={
              isSelected ? { background: "var(--color-surface)" } : undefined
            }
          >
            <Avatar image={friend.image} name={friend.name} size="md" />
            <div className="overflow-hidden flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: "var(--color-text)" }}
              >
                {friend.name ?? "Utilisateur"}
              </div>
              <div
                className="text-[11px] truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                {friend.email}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
