import React, { useState } from "react";
import { Sidebar, AppHeader } from "@/components/organisms";
import type { SidebarNavSection, SidebarUser } from "@/components/organisms";

export interface AppLayoutProps {
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
    <div className="bg-[#050505] text-neutral-300 h-screen flex overflow-hidden antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar
        sections={sidebarSections}
        user={user}
        onUserClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
        <AppHeader
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onLogout={onLogout}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
