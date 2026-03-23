import { Avatar } from "@/components/atoms";
import { Link } from "@tanstack/react-router";

export interface UserCardProps {
  userName: string;
  userBadge: string;
  userAvatar: string | null;
  onClick?: () => void;
}

export function UserCard({
  userName,
  userBadge,
  userAvatar,
  onClick,
}: UserCardProps) {
  return (
    <div
      className="p-4 shrink-0"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <Link
        to="/profil"
        onClick={onClick}
        className="cursor-pointer flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left border border-transparent hover:border-white/5 group"
      >
        <Avatar image={userAvatar} name={userName} size="lg" />
        <div className="hidden lg:block overflow-hidden">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--color-text)" }}
          >
            {userName}
          </p>
          <p
            className="text-[11px] truncate group-hover:text-indigo-300 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            {userBadge}
          </p>
        </div>
      </Link>
    </div>
  );
}