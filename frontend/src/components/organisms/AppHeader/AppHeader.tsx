import { HiBell, HiMagnifyingGlass } from "react-icons/hi2";
import { MobileMenuToggle, AuthNavButton } from "@/components/molecules";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

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
  const [selectedCategory, setSelectedCategory] = useState("Catégories");

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

        <button className="relative p-2 text-neutral-400 hover:text-white transition-colors">
          <HiBell size={22} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#141414]" />
        </button>

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
