import { HiOutlinePlayCircle } from "react-icons/hi2";

interface LogoProps {
  showText?: boolean;
}

export function Logo({ showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <HiOutlinePlayCircle size={22} />
        </div>
      </div>
      {showText && (
        <span
          className="font-bold text-xl tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          CineConnect
        </span>
      )}
    </div>
  );
}
