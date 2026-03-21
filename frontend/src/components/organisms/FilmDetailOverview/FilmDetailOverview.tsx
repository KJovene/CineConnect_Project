import { RatingStars } from "@/components/atoms";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";

export interface FilmDetailMovie {
  title: string;
  year: number | null;
  runtime: string | null;
  plot: string | null;
  director: string | null;
  awards: string | null;
  genre: string | null;
  type: "movie" | null;
  poster_url: string | null;
  average_rating: number | null;
  ratings_count: number;
}

interface FilmDetailOverviewProps {
  movie: FilmDetailMovie;
}

export function FilmDetailOverview({ movie }: FilmDetailOverviewProps) {
  const genres: string[] = movie.genre ? movie.genre.split(", ") : [];
  const roundedAverageRating =
    typeof movie.average_rating === "number"
      ? Math.round(movie.average_rating * 10) / 10
      : null;
  const starsRating =
    roundedAverageRating === null
      ? 0
      : Math.max(1, Math.min(5, Math.round(roundedAverageRating)));

  return (
    <>
      {/* Hero image — les overlays noirs restent hardcodés (sur image) */}
      <div className="relative w-full h-[60vh] lg:h-[65vh]">
        <img
          src={getPosterUrl(movie.poster_url ?? undefined)}
          className="w-full h-full object-cover object-center"
          alt={movie.title}
          onError={handlePosterError}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent" />
      </div>

      <div className="relative z-10 -mt-32 w-full max-w-6xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">

            {/* Titre + métadonnées */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm lg:text-base font-medium text-white">
                <span>{movie.year}</span>
                {movie.runtime && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <span>{movie.runtime}</span>
                  </>
                )}

                {roundedAverageRating !== null && (
                  <div
                    className="lg:flex-none lg:ml-auto flex items-center gap-2 backdrop-blur-md px-3 py-1 rounded-full" // ← supprimé flex-1
                    style={{
                      background: "rgba(0,0,0,0.5)", // ← fond sombre sur image dans les 2 thèmes
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <RatingStars rating={starsRating} size={14} />
                    <span className="text-white font-semibold">
                      {roundedAverageRating.toFixed(1)}
                    </span>
                    <span className="text-white/60 text-xs">/ 5</span>
                    <span className="text-white/60 text-xs">
                      ({movie.ratings_count} note{movie.ratings_count > 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="max-w-3xl">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mt-20 mb-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                Résumé
              </h3>
              <p className="text-lg leading-relaxed" style={{ color: "var(--color-text)" }}>
                {movie.plot ?? "Aucun synopsis disponible."}
              </p>
            </div>

            {/* Détails */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8"
              style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
            >
              {movie.director && (
                <div>
                  <h4
                    className="text-xs mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Réalisateur
                  </h4>
                  <p className="font-medium" style={{ color: "var(--color-text)" }}>
                    {movie.director}
                  </p>
                </div>
              )}
              {movie.awards && (
                <div>
                  <h4
                    className="text-xs mb-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Récompenses
                  </h4>
                  <p className="text-sm" style={{ color: "var(--color-text)" }}>
                    {movie.awards}
                  </p>
                </div>
              )}
              <div className="col-span-2 md:col-span-1">
                <h4
                  className="text-xs mb-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Genres
                </h4>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {movie.type && (
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Type
                </h3>
                <p className="capitalize" style={{ color: "var(--color-text)" }}>
                  Film
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block lg:w-12" />
        </div>
      </div>
    </>
  );
}