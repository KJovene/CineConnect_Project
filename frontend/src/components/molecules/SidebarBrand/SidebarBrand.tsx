import { HiOutlinePlayCircle } from "react-icons/hi2";
import { Link } from "@tanstack/react-router";

export function SidebarBrand() {
  return (
    <Link
      to="/"
      className="h-20 flex items-center justify-center lg:justify-start lg:px-6 shrink-0"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white z-10">
            <HiOutlinePlayCircle size={18} />
          </div>
        </div>
        <div className="hidden lg:flex flex-col">
          <span
            className="font-bold text-lg tracking-tight leading-none"
            style={{ color: "var(--color-text)" }}
          >
            CineConnect
          </span>
          <span
            className="text-[10px] font-medium tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            SOCIAL HUB
          </span>
        </div>
      </div>
    </Link>
  );
}
