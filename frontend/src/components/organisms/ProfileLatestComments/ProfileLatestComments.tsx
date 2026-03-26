import { useEffect, useMemo, useState } from "react";
import type { LatestUserComment } from "@/hooks/useReviews";
import { getPosterUrl } from "@/media/utils/poster";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export interface ProfileLatestCommentsProps {
  comments: LatestUserComment[];
  isLoading: boolean;
  onOpenFilm: (omdbId: string) => void;
}

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE);
  const safeTotalPages = Math.max(1, totalPages);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < safeTotalPages;

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return comments.slice(start, end);
  }, [comments, currentPage]);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
      return;
    }

    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

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
          {paginatedComments.map((item) => (
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

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={!hasPrevPage}
              className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
              aria-label="Page précédente des commentaires"
            >
              <HiChevronLeft size={18} />
            </button>

            <span
              className="text-xs"
              style={{ color: "var(--color-text-muted)" }}
            >
              {currentPage} / {safeTotalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(safeTotalPages, page + 1))
              }
              disabled={!hasNextPage}
              className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
              aria-label="Page suivante des commentaires"
            >
              <HiChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
