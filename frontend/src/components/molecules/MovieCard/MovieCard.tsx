import { HiStar } from "react-icons/hi2";

export interface MovieCardProps {
  image: string;
  title: string;
  director: string;
  year: string;
  rating?: string;
  isPercentage?: boolean;
}

export function MovieCard({
  image,
  title,
  director,
  year,
  rating,
  isPercentage,
}: MovieCardProps) {
  return (
    <div className="group relative aspect-2/3 rounded-xl overflow-hidden cursor-pointer bg-[#0A0A0A] border border-white/5 hover:border-white/20 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

      {rating && (
        <div
          className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold border border-white/10 flex items-center gap-1 shadow-lg"
          style={{ color: isPercentage ? "#10b981" : "#fbbf24" }}
        >
          {!isPercentage && <HiStar size={10} />}
          {rating}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white font-semibold tracking-tight mb-1 truncate text-lg">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors">
          <span>{director}</span>
          <span>{year}</span>
        </div>
      </div>
    </div>
  );
}
