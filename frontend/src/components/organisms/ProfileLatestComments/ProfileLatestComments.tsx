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
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text)" }}
      >
        Derniers commentaires
      </h2>

      {isLoading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Chargement...
        </p>
      ) : comments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Aucun commentaire pour le moment.
        </p>
      ) : (
        <div className="space-y-2">
          {comments.map((item) => (
            <button
              key={item.reviewId}
              type="button"
              onClick={() => onOpenFilm(item.omdbId)}
              className="w-full text-left rounded-xl px-3 py-2 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-colors cursor-pointer"
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={getPosterUrl(item.posterUrl)}
                  alt={item.filmTitle}
                  onError={handlePosterError}
                  className="w-10 h-14 rounded-md object-cover shrink-0"
                  style={{ border: "1px solid var(--color-border)" }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {item.filmTitle}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {item.isReply ? "Réponse" : "Commentaire"} —{" "}
                    {formatDate(item.createdAt)}
                  </p>
                  <p
                    className="text-sm mt-1 truncate"
                    style={{ color: "var(--color-text)" }}
                  >
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