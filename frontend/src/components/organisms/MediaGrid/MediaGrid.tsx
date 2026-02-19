import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { Badge } from "@/components/atoms";
import { MovieCard, type MovieCardProps } from "@/components/molecules";

export interface MediaGridProps {
  title: string;
  badge?: string;
  movies: MovieCardProps[];
}

export function MediaGrid({ title, badge, movies }: MediaGridProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          {badge && <Badge>{badge}</Badge>}
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white">
            <HiChevronLeft size={18} />
          </button>
          <button className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition text-neutral-400 hover:text-white">
            <HiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie, index) => (
          <MovieCard key={index} {...movie} />
        ))}
      </div>
    </section>
  );
}
