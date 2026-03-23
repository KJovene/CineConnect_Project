import React from "react";
import { SidebarBrand, UserCard } from "@/components/molecules";
import { Link, useRouterState } from "@tanstack/react-router";
import { Avatar } from "@/components/atoms";

export interface SidebarNavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  showNotification?: boolean;
}

export interface SidebarNavSection {
  title: string;
  items: SidebarNavItem[];
}

export interface SidebarUser {
  name: string;
  badge: string;
  avatar: string | null;
}

export interface SidebarProps {
  sections: SidebarNavSection[];
  user: SidebarUser;
  onUserClick?: () => void;
}

export function Sidebar({ sections, user, onUserClick }: SidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const allItems = sections.flatMap((s) => s.items);

  return (
    <>
      {/*Sidebar desktop*/}
      <aside
        className="hidden lg:flex w-64 flex-col h-full shrink-0"
        style={{
          background: "var(--color-bg)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <SidebarBrand />

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
          {sections.map((section, index) => (
            <div key={index}>
              <div
                className="text-[10px] font-semibold uppercase tracking-widest mb-3 px-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                {section.title}
              </div>

              {section.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  to={item.href}
                  className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg transition-all group"
                  style={{
                    background: isItemActive(item.href)
                      ? "var(--color-surface)"
                      : "transparent",
                    border: `1px solid ${isItemActive(item.href) ? "var(--color-border)" : "transparent"}`,
                    color: isItemActive(item.href)
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  }}
                >
                  <div
                    className={`shrink-0 transition-colors ${
                      isItemActive(item.href)
                        ? "text-indigo-400 group-hover:text-indigo-300"
                        : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.showNotification && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                </Link>
              ))}

              {index < sections.length - 1 && <div className="mt-6" />}
            </div>
          ))}
        </nav>

        <UserCard
          userName={user.name}
          userBadge={user.badge}
          userAvatar={user.avatar}
          onClick={onUserClick}
        />
      </aside>

      {/* Bottom bar menu (mobile) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 h-16"
        style={{
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {allItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            to={item.href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all"
            style={{
              color: isItemActive(item.href)
                ? "var(--color-text)"
                : "var(--color-text-muted)",
            }}
          >
            <div
              className={`transition-colors ${
                isItemActive(item.href) ? "text-indigo-400" : ""
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] font-medium truncate">
              {item.label}
            </span>
          </Link>
        ))}

          <Link
            to="/profil"
            className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-all"
            style={{
              color: isItemActive("/profil")
                ? "var(--color-text)"
                : "var(--color-text-muted)",
            }}
          >
            <Avatar image={user.avatar} name={user.name} size="sm" />
            <span className="text-[10px] font-medium truncate">Profil</span>
          </Link>
      </nav>
    </>
  );
}