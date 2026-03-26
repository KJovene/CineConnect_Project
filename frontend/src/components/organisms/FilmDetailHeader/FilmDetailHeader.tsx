import { Link } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi2";

export function FilmDetailHeader() {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-12 fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <Link
          to="/film"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <HiArrowLeft size={20} className="text-white" />
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="h-6 w-px bg-white/20" />
      </div>
    </header>
  );
}