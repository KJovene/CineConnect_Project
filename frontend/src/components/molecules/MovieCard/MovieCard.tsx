import { HiStar } from "react-icons/hi2";
import { Link } from "@tanstack/react-router";
import {
  getPosterUrl,
  handlePosterError,
} from "@/features/media/utils/poster";

export interface MovieCardProps {
  image: string;
  title: string;
  director: string;
  year: string;
  rating?: number | null;
  omdb_id?: string;
}

export function MovieCard({
  image,
  title,
  director,
  year,
  rating,
  omdb_id,
}: MovieCardProps) {
  const hasRating = typeof rating === "number" && rating > 0;
  const displayRating = hasRating
    ? (Math.round(rating * 10) / 10).toFixed(1)
    : null;

  const content = (
    <>
      <img
        src={getPosterUrl(image)}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={handlePosterError}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 flex items-center gap-1 shadow-lg">
        <HiStar
          size={10}
          className={hasRating ? "text-amber-400" : "text-neutral-500"}
        />
        {displayRating && (
          <span className="text-amber-400">{displayRating}</span>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-semibold tracking-tight mb-1 truncate text-lg">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
          <span>{director}</span>
          <span>{year}</span>
        </div>
      </div>
    </>
  );

  const className =
    "group block w-full relative aspect-2/3 rounded-xl overflow-hidden cursor-pointer bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/10";

  if (omdb_id) {
    return (
      <Link to="/film/$id" params={{ id: omdb_id }} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
