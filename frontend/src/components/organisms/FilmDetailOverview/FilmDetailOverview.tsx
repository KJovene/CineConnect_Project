import { HiBookmark, HiPencil, HiPlay, HiStar } from "react-icons/hi2";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";

export interface FilmDetailMovie {
  title: string;
  year: number | null;
  runtime: string | null;
  imdb_rating: string | null;
  plot: string | null;
  director: string | null;
  awards: string | null;
  genre: string | null;
  type: "movie" | "series" | "episode" | null;
  poster_url: string | null;
}

interface FilmDetailOverviewProps {
  movie: FilmDetailMovie;
}

export function FilmDetailOverview({ movie }: FilmDetailOverviewProps) {
  const genres: string[] = movie.genre ? movie.genre.split(", ") : [];

  return (
    <>
      <div className="relative w-full h-[60vh] lg:h-[65vh]">
        <img
          src={getPosterUrl(movie.poster_url ?? undefined)}
          className="w-full h-full object-cover object-center"
          alt={movie.title}
          onError={handlePosterError}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent"></div>
      </div>

      <div className="relative z-10 -mt-32 w-full max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm lg:text-base font-medium text-neutral-300">
                <span className="text-white">{movie.year}</span>
                {movie.runtime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                    <span>{movie.runtime}</span>
                  </>
                )}

                {movie.imdb_rating && movie.imdb_rating !== "N/A" && (
                  <div className="flex-1 lg:flex-none lg:ml-auto flex items-center gap-2 bg-neutral-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <HiStar className="text-amber-400" size={18} />
                    <span className="text-white font-semibold">
                      {movie.imdb_rating}
                    </span>
                    <span className="text-neutral-500 text-xs">/ 10</span>
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-3xl">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Resume
              </h3>
              <p className="text-lg text-neutral-300 leading-relaxed">
                {movie.plot ? movie.plot : "Aucun synopsis disponible."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-neutral-800/50">
              {movie.director && (
                <div>
                  <h4 className="text-xs text-neutral-500 mb-1">Realisateur</h4>
                  <p className="text-white font-medium">{movie.director}</p>
                </div>
              )}
              {movie.awards && (
                <div>
                  <h4 className="text-xs text-neutral-500 mb-1">Recompenses</h4>
                  <p className="text-neutral-300 text-sm">{movie.awards}</p>
                </div>
              )}
              <div className="col-span-2 md:col-span-1">
                <h4 className="text-xs text-neutral-500 mb-2">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {movie.type && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Type
                </h3>
                <p className="text-neutral-300 capitalize">
                  {movie.type === "movie"
                    ? "Film"
                    : movie.type === "series"
                      ? "Serie"
                      : movie.type}
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:w-12"></div>
        </div>
      </div>
    </>
  );
}
