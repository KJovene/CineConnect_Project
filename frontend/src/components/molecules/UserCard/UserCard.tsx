export interface UserCardProps {
  userName: string;
  userBadge: string;
  userAvatar: string;
  onClick?: () => void;
}

export function UserCard({
  userName,
  userBadge,
  userAvatar,
  onClick,
}: UserCardProps) {
  return (
    <div className="p-4 border-t border-white/5 shrink-0">
      <button
        onClick={onClick}
        className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5 group"
      >
        <img
          src={userAvatar}
          alt={userName}
          className="w-9 h-9 rounded-full ring-2 ring-neutral-800 group-hover:ring-neutral-700 transition-all"
        />
        <div className="hidden lg:block overflow-hidden">
          <div className="text-sm font-medium text-white truncate">
            {userName}
          </div>
          <div className="text-[11px] text-neutral-500 truncate">
            {userBadge}
          </div>
        </div>
      </button>
    </div>
  );
}
