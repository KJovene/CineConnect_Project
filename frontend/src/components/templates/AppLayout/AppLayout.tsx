import React, { useState } from "react";
import {
  Sidebar,
  AppHeader,
  type SidebarNavSection,
  type SidebarUser,
} from "@/components/organisms";

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarSections: SidebarNavSection[];
  user: SidebarUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  onLogout: () => void;
}

export function AppLayout({
  children,
  sidebarSections,
  user,
  isAuthenticated,
  isLoading,
  onLogout,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="h-screen flex overflow-hidden antialiased selection:bg-indigo-500/30 selection:text-indigo-200"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)",
      }}
    >
      <Sidebar
        sections={sidebarSections}
        user={user}
        onUserClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <main
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{ background: "var(--color-bg)" }}
      >
        <AppHeader
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar pb-16 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
