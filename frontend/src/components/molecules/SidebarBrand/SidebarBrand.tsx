import { HiOutlinePlayCircle } from "react-icons/hi2";

export function SidebarBrand() {
  return (
    <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/5 shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white z-10">
            <HiOutlinePlayCircle size={18} />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808] z-20" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="font-bold text-lg tracking-tight text-white leading-none">
            CineConnect
          </span>
          <span className="text-[10px] text-neutral-500 font-medium tracking-wide">
            SOCIAL HUB
          </span>
        </div>
      </div>
    </div>
  );
}
