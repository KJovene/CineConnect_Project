import { HiStar, HiInformationCircle } from "react-icons/hi2";
import { Badge } from "@/components/atoms";

export function HeroSection() {
  return (
    <div
      className="relative w-full h-128 flex items-end"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #050505, rgba(5, 5, 5, 0.6), transparent)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #050505, rgba(5, 5, 5, 0.4), transparent)",
        }}
      />

      <div className="relative z-10 px-8 pb-16 pt-16 w-full max-w-5xl">
        <div className="flex items-center gap-3 mb-5">
          <Badge variant="indigo">À la une</Badge>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/5">
            <HiStar className="text-amber-400" size={12} />
            <span className="text-xs text-neutral-200 font-medium">8.9/10</span>
          </div>
          <span className="text-xs text-neutral-300 font-medium">
            • Science-Fiction • 2024
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
          Chroniques de l'Infini
        </h1>

        <p className="text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl mb-10 line-clamp-3 font-light">
          Dans un futur où l'humanité a conquis les étoiles, une découverte
          archéologique sur une planète oubliée remet en question l'origine même
          de la conscience. Découvrez les discussions passionnées de notre
          communauté sur ce chef-d'œuvre.
        </p>

        <button className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
          <HiInformationCircle size={20} />
          Plus de détails
        </button>
      </div>
    </div>
  );
}
