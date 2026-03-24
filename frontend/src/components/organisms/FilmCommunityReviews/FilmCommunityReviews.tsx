import { useEffect, useMemo, useState } from "react";
import {
  HiChatBubbleLeftRight,
  HiEllipsisHorizontal,
  HiPencilSquare,
  HiStar,
  HiTrash,
} from "react-icons/hi2";
import {
  type FilmReviewComment,
  type ReviewReply,
  useCreateFilmComment,
  useCreateFilmReply,
  useDeleteFilmComment,
  useFilmRatingSummary,
  useFilmReviews,
  useUpsertFilmRating,
  useUpdateFilmComment,
} from "@/features/reviews/hooks";
import { Avatar } from "@/components/atoms";
import { useSession } from "@/lib/auth-client";

type ReviewItem = FilmReviewComment | ReviewReply;

interface FilmCommunityReviewsProps {
  omdbId: string;
}

function formatCommentDate(value: string | null): string {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function FilmCommunityReviews({ omdbId }: FilmCommunityReviewsProps) {
  const { data: session } = useSession();
  const { data: reviews = [], isLoading: reviewsLoading } = useFilmReviews(omdbId);
  const { data: ratingSummary } = useFilmRatingSummary(omdbId);
  const createComment = useCreateFilmComment(omdbId);
  const createReply = useCreateFilmReply(omdbId);
  const updateComment = useUpdateFilmComment(omdbId);
  const deleteComment = useDeleteFilmComment(omdbId);
  const upsertRating = useUpsertFilmRating(omdbId);

  const currentUserId = useMemo(() => {
    const rawId = session?.user?.id;
    if (!rawId) return null;
    const parsed = Number.parseInt(rawId, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [session?.user?.id]);

  const [newComment, setNewComment] = useState("");
  const [localRatingOverride, setLocalRatingOverride] = useState<number | null>(null);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [openedMenuId, setOpenedMenuId] = useState<number | null>(null);

  const selectedRating = localRatingOverride ?? ratingSummary?.userRating ?? 0;

  useEffect(() => {
    if (reviewsLoading || reviews.length === 0) return;
    if (!window.location.hash.startsWith("#comment-")) return;
    const targetId = window.location.hash.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, [reviews, reviewsLoading]);

  const handleCreateComment = async () => {
    const comment = newComment.trim();
    if (!comment) return;
    await createComment.mutateAsync({
      comment,
      rating: selectedRating > 0 ? selectedRating : undefined,
    });
    setNewComment("");
  };

  const handleRateFilm = async (rating: number) => {
    if (!session?.user?.id) return;
    setLocalRatingOverride(rating);
    await upsertRating.mutateAsync({ rating });
  };

  const handleCreateReply = async (parentReviewId: number) => {
    const comment = replyText.trim();
    if (!comment) return;
    await createReply.mutateAsync({ reviewId: parentReviewId, payload: { comment } });
    setReplyTargetId(null);
    setReplyText("");
  };

  const handleStartEdit = (item: ReviewItem) => {
    setOpenedMenuId(null);
    setEditingReviewId(item.reviewId);
    setEditingText(item.comment);
  };

  const handleSaveEdit = async (reviewId: number) => {
    const comment = editingText.trim();
    if (!comment) return;
    await updateComment.mutateAsync({ reviewId, payload: { comment } });
    setEditingReviewId(null);
    setEditingText("");
  };

  const handleDelete = async (reviewId: number) => {
    await deleteComment.mutateAsync(reviewId);
    if (editingReviewId === reviewId) {
      setEditingReviewId(null);
      setEditingText("");
    }
  };

  // Styles partagés pour les textareas
  const textareaStyle = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
  };

  const renderReviewRow = (
    item: ReviewItem,
    options?: { isReply?: boolean; canReply?: boolean },
  ) => {
    const isReply = options?.isReply ?? false;
    const canReply = options?.canReply ?? false;
    const isMine = currentUserId !== null && item.author.id === currentUserId;
    const isEditing = editingReviewId === item.reviewId;

    return (
      <article
        key={item.reviewId}
        className={`rounded-2xl ${isReply ? "p-4" : "p-5"}`}
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start gap-3">
          <Avatar image={item.author.image} name={item.author.name} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {item.author.name}
              </p>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {formatCommentDate(item.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  style={textareaStyle}
                  placeholder="Modifiez votre commentaire"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveEdit(item.reviewId)}
                    disabled={updateComment.isPending || !editingText.trim()}
                    className="rounded-lg bg-white text-black px-3 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingReviewId(null); setEditingText(""); }}
                    className="rounded-lg px-3 py-1.5 text-xs cursor-pointer"
                    style={{
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="mt-2 text-sm leading-relaxed whitespace-pre-wrap cursor-pointer"
                style={{ color: "var(--color-text)" }}
              >
                {item.comment}
              </p>
            )}

            {canReply && !isEditing && (
              <button
                type="button"
                onClick={() => {
                  if (replyTargetId === item.reviewId) {
                    setReplyTargetId(null);
                    setReplyText("");
                    return;
                  }
                  setReplyTargetId(item.reviewId);
                  setReplyText("");
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium hover:text-indigo-400 transition-colors cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}
              >
                <HiChatBubbleLeftRight size={14} />
                Répondre
              </button>
            )}
          </div>

          {isMine && !isEditing && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenedMenuId((prev) => prev === item.reviewId ? null : item.reviewId)
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}
              >
                <HiEllipsisHorizontal size={18} />
              </button>

              {openedMenuId === item.reviewId && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-xl p-1 shadow-xl z-10"
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ color: "var(--color-text)" }}
                  >
                    <HiPencilSquare size={14} />
                    Editer
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.reviewId)}
                    className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <HiTrash size={14} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div
      className="mt-20 pt-10"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <div className="flex items-center justify-between mb-8">
        <h2
          className="text-xl font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Avis de la communauté
        </h2>
      </div>

      <div className="space-y-6">

        {/* Bloc note */}
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--color-text)" }}>
                Votre note
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Une seule note par film, vous pouvez la modifier quand vous voulez.
              </p>
            </div>

            {session?.user?.id ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void handleRateFilm(value)}
                    disabled={upsertRating.isPending}
                    className="rounded-md p-1 transition hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                    aria-label={`Noter ${value} sur 5`}
                  >
                    <HiStar
                      size={24}
                      className={value <= selectedRating ? "text-amber-400" : "text-neutral-500"}
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Connectez-vous pour noter ce film.
              </p>
            )}
          </div>
        </div>

        {/* Bloc commentaire */}
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <label className="block text-sm mb-2" style={{ color: "var(--color-text)" }}>
            Partage ton avis
          </label>
          {selectedRating === 0 && (
            <p
              className="mb-3 text-xs"
              style={{
                color: newComment.trim().length > 0
                  ? "#ef4444"
                  : "var(--color-text-muted)",
              }}
            >
              {session?.user?.id
                ? "Vous devez noter ce film avant de pouvoir laisser un commentaire."
                : "Connectez-vous et notez ce film avant de pouvoir laisser un commentaire."}
            </p>
          )}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
            style={textareaStyle}
            placeholder="Ecrire un commentaire..."
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void handleCreateComment()}
              disabled={createComment.isPending || !newComment.trim() || selectedRating === 0}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50 cursor-pointer"
            >
              Publier
            </button>
          </div>
        </div>

        {/* Erreur */}
        {(createComment.error || upsertRating.error || createReply.error || updateComment.error || deleteComment.error) && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">
            Une erreur est survenue pendant l'opération sur les commentaires.
          </div>
        )}

        {/* Liste des avis */}
        {reviewsLoading ? (
          <div className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
            Chargement des avis...
          </div>
        ) : reviews.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-text-muted)" }}>
              Aucun avis pour le moment. Soyez le premier à commenter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.reviewId}
                id={`comment-${review.reviewId}`}
                className="space-y-3 scroll-mt-28"
              >
                {renderReviewRow(review, { canReply: true })}

                {replyTargetId === review.reviewId && (
                  <div
                    className="ml-4 md:ml-10 rounded-xl p-4"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      style={textareaStyle}
                      placeholder="Ecrire une réponse..."
                    />
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => { setReplyTargetId(null); setReplyText(""); }}
                        className="rounded-lg px-3 py-1.5 text-xs"
                        style={{
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text)",
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCreateReply(review.reviewId)}
                        disabled={createReply.isPending || !replyText.trim()}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                      >
                        Répondre
                      </button>
                    </div>
                  </div>
                )}

                {review.replies.length > 0 && (
                  <div
                    className="ml-4 md:ml-10 space-y-3 pl-4"
                    style={{ borderLeft: "1px solid var(--color-border)" }}
                  >
                    {review.replies.map((reply) => renderReviewRow(reply, { isReply: true }))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}