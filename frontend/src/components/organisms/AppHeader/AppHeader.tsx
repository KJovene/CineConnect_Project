import { useEffect, useMemo, useRef, useState } from "react";
import { HiBell, HiMagnifyingGlass } from "react-icons/hi2";
import { AuthNavButton } from "@/components/molecules";
import { Link, useNavigate } from "@tanstack/react-router";
import { useNotificationsFeed } from "@/hooks/useNotifications";
import { ThemeToggle } from "@/components/atoms";

interface AppHeaderProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onLogout: () => void;
}

export function AppHeader({
  isAuthenticated,
  isLoading,
  onLogout,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);
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
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
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
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
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
        background: "var(--color-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          to="/search"
          className="p-2.5 rounded-lg transition-all hover:border-indigo-500/50"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          <HiMagnifyingGlass size={20} />
        </Link>
      </div>

      <div className="flex items-center gap-5 ml-auto">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setIsNotificationsOpen((previous) => !previous)}
            className="relative p-2 transition-colors cursor-pointer"
            style={{ color: "var(--color-text-muted)" }}
          >
            <HiBell size={22} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-semibold text-white flex items-center justify-center"
                style={{ border: "1px solid var(--color-bg)" }}
              >
                {formattedCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div
              className="fixed sm:absolute right-0 sm:right-0 left-0 sm:left-auto mx-4 sm:mx-0 mt-2 sm:w-[340px] max-h-[70vh] overflow-y-auto rounded-xl backdrop-blur-md shadow-2xl z-50"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  Notifications
                </p>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  Tout marquer comme lu
                </button>
              </div>

              {notifications.length === 0 ? (
                <p
                  className="px-4 py-6 text-sm text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Aucune notification pour le moment.
                </p>
              ) : (
                <div className="py-1">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(notification.id).catch(
                          console.error,
                        )
                      }
                      className={`cursor-pointer w-full text-left px-4 py-3 transition-colors ${
                        notification.isRead
                          ? "bg-transparent hover:bg-white/5"
                          : "bg-indigo-500/10 hover:bg-indigo-500/15"
                      }`}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        color: notification.isRead
                          ? "var(--color-text-muted)"
                          : "var(--color-text)",
                      }}
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

        <div
          className="h-6 w-px mx-1"
          style={{ background: "var(--color-border)" }}
        />
        <ThemeToggle />
        <div
          className="h-6 w-px mx-1"
          style={{ background: "var(--color-border)" }}
        />
        <AuthNavButton
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
