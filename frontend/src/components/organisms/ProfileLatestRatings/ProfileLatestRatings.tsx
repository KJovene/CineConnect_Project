import type { LatestUserRating } from "@/features/reviews/hooks";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";

interface ProfileLatestRatingsProps {
  ratings: LatestUserRating[];
  isLoading: boolean;
  onOpenFilm: (omdbId: string) => void;
}

function formatDate(dateLike?: string | null): string {
  if (!dateLike) return "-";

  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ProfileLatestRatings({
  ratings,
  isLoading,
  onOpenFilm,
}: ProfileLatestRatingsProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-5">
      <h2 className="text-lg font-semibold text-white mb-4">Dernieres notes</h2>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Chargement...</p>
      ) : ratings.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucune note pour le moment.</p>
      ) : (
        <div className="space-y-2">
          {ratings.map((rating) => (
            <button
              key={rating.reviewId}
              type="button"
              onClick={() => onOpenFilm(rating.omdbId)}
              className="w-full text-left rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getPosterUrl(rating.posterUrl)}
                  alt={rating.filmTitle}
                  onError={handlePosterError}
                  className="w-10 h-14 rounded-md object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {rating.filmTitle}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Note: {rating.rating}/5 - {formatDate(rating.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
