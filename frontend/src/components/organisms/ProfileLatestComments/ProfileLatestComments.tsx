import type { LatestUserComment } from "@/features/reviews/hooks";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";

interface ProfileLatestCommentsProps {
  comments: LatestUserComment[];
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

export function ProfileLatestComments({
  comments,
  isLoading,
  onOpenFilm,
}: ProfileLatestCommentsProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0A0A0A] p-5">
      <h2 className="text-lg font-semibold text-white mb-4">
        Derniers commentaires
      </h2>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Chargement...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <div className="space-y-2">
          {comments.map((item) => (
            <button
              key={item.reviewId}
              type="button"
              onClick={() => onOpenFilm(item.omdbId)}
              className="w-full text-left rounded-xl border border-white/10 bg-black/20 px-3 py-2 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={getPosterUrl(item.posterUrl)}
                  alt={item.filmTitle}
                  onError={handlePosterError}
                  className="w-10 h-14 rounded-md object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {item.filmTitle}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {item.isReply ? "Reponse" : "Commentaire"} -{" "}
                    {formatDate(item.createdAt)}
                  </p>
                  <p className="text-sm text-neutral-300 mt-1 truncate">
                    {item.comment}
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
