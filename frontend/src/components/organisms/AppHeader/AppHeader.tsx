import { useEffect, useMemo, useRef, useState } from "react";
import { HiBell, HiMagnifyingGlass } from "react-icons/hi2";
import { MobileMenuToggle, AuthNavButton } from "@/components/molecules";
import { Link, useNavigate } from "@tanstack/react-router";
import { useNotificationsFeed } from "@/features/notifications/hooks";

export interface AppHeaderProps {
  onMobileMenuToggle: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  onLogout: () => void;
}

export function AppHeader({
  onMobileMenuToggle,
  isAuthenticated,
  isLoading,
  onLogout,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationsFeed();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const formattedCount = useMemo(() => {
    if (unreadCount > 99) return "99+";
    return unreadCount.toString();
  }, [unreadCount]);

  const handleNotificationClick = async (notificationId: string) => {
    const selected = notifications.find((item) => item.id === notificationId);
    if (!selected) return;
    const target = selected.target;

    markAsRead(selected.id);
    setIsNotificationsOpen(false);

    if (target.kind === "friend-request") {
      await navigate({ to: "/profil" });
      window.setTimeout(() => {
        window.location.hash = "friends-section";
        document
          .getElementById("friends-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
      return;
    }

    if (target.kind === "message") {
      await navigate({
        to: "/discussion",
        search: { friendId: String(target.friendId) },
      });
      return;
    }

    await navigate({ to: "/film/$id", params: { id: target.omdbId } });
    window.setTimeout(() => {
      const elementId = `comment-${target.parentReviewId}`;
      window.location.hash = elementId;
      document
        .getElementById(elementId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  return (
    <header
      className="absolute top-0 left-0 right-0 z-20 h-20 flex items-center justify-between px-8"
      style={{
        background: "rgba(20, 20, 20, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          to="/search"
          className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-indigo-500/50 transition-all"
        >
          <HiMagnifyingGlass size={20} />
        </Link>
      </div>

      <div className="flex items-center gap-5 ml-auto">
        <MobileMenuToggle onClick={onMobileMenuToggle} />

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((previous) => !previous)}
            className="relative p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <HiBell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-semibold text-white border border-[#141414] flex items-center justify-center">
                {formattedCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-[340px] max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0C0C0C]/95 backdrop-blur-md shadow-2xl z-50">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  Notifications
                </p>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  Tout marquer comme lu
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-neutral-500 text-center">
                  Aucune notification pour le moment.
                </p>
              ) : (
                <div className="py-1">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        void handleNotificationClick(notification.id)
                      }
                      className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                        notification.isRead
                          ? "bg-transparent text-neutral-500 hover:bg-white/5"
                          : "bg-indigo-500/10 text-neutral-100 hover:bg-indigo-500/15"
                      }`}
                    >
                      <p className="text-xs font-semibold">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed line-clamp-2">
                        {notification.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-white/10 mx-1" />

        <AuthNavButton
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
