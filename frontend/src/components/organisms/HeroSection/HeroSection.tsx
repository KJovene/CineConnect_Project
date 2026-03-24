import { HiStar, HiInformationCircle } from "react-icons/hi2";
import { Badge } from "@/components/atoms";
import { Link } from "@tanstack/react-router";
import { getHighQualityPosterUrl } from "@/features/media/utils/poster";
import type { Film } from "@cineconnect/shared";

export interface HeroSectionProps {
  film?: Film;
  isLoading?: boolean;
}

export function HeroSection({ film, isLoading }: HeroSectionProps) {
  if (isLoading) {
    return (
      <div className="relative w-full h-128 flex items-end bg-neutral-900/50 animate-pulse">
        <div className="relative z-10 px-8 pb-16 pt-16 w-full max-w-5xl">
          <div className="h-8 bg-neutral-800 rounded w-1/3 mb-6"></div>
          <div className="h-16 bg-neutral-800 rounded w-2/3 mb-6"></div>
          <div className="h-24 bg-neutral-800 rounded w-full mb-10"></div>
        </div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="relative w-full h-128 flex items-center justify-center bg-neutral-900">
        <p className="text-neutral-500">Aucun film à afficher</p>
      </div>
    );
  }

  const posterUrl = getHighQualityPosterUrl(film.poster_url);
  const communityRating =
    typeof film.average_rating === "number" && film.average_rating > 0
      ? film.average_rating
      : null;
  const displayCommunityRating =
    communityRating !== null
      ? (Math.round(communityRating * 10) / 10).toFixed(1)
      : null;

  return (
    <div className="relative w-full h-128 flex items-end overflow-hidden bg-neutral-900">
      <img
        src={posterUrl}
        alt={film.title}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
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
          {displayCommunityRating && (
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/5">
              <HiStar className="text-amber-400" size={12} />
              <span className="text-xs text-neutral-200 font-medium">
                {displayCommunityRating}
              </span>
            </div>
          )}
          <span className="text-xs text-neutral-300 font-medium">
            {film.genre && `• ${film.genre.split(", ")[0]}`}
            {film.year && ` • ${film.year}`}
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white mb-6 leading-tight drop-shadow-2xl">
          {film.title}
        </h1>

        <p className="text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl mb-10 line-clamp-3 font-light">
          {film.plot ||
            "Découvrez les discussions passionnées de notre communauté sur ce film."}
        </p>

        <Link
          to="/film/$id"
          params={{ id: film.omdb_id }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          <HiInformationCircle size={20} />
          Plus de détails
        </Link>
      </div>
    </div>
  );
}
