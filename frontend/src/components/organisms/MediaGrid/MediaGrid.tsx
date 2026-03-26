import { Badge } from "@/components/atoms";
import { MovieCard, type MovieCardProps } from "@/components/molecules";

interface MediaGridProps {
  title: string;
  badge?: string;
  movies: MovieCardProps[];
}

export function MediaGrid({ title, badge, movies }: MediaGridProps) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h2
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          {badge && <Badge>{badge}</Badge>}
        </div>
        <div className="flex gap-2">
          <button
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          ></button>
          <button
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/5 transition"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          ></button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.omdb_id ?? movie.title} {...movie} />
        ))}
      </div>
    </section>
  );
}
