import { useMemo, useState } from "react";
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
  const { data: reviews = [], isLoading: reviewsLoading } =
    useFilmReviews(omdbId);
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
  const [localRatingOverride, setLocalRatingOverride] = useState<number | null>(
    null,
  );
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [openedMenuId, setOpenedMenuId] = useState<number | null>(null);

  const selectedRating = localRatingOverride ?? ratingSummary?.userRating ?? 0;

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

    await createReply.mutateAsync({
      reviewId: parentReviewId,
      payload: { comment },
    });

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

    await updateComment.mutateAsync({
      reviewId,
      payload: { comment },
    });

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
        className={`rounded-2xl border border-neutral-800/70 bg-neutral-950/60 ${
          isReply ? "p-4" : "p-5"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar image={item.author.image} name={item.author.name} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white font-medium text-sm">
                {item.author.name}
              </p>
              <span className="text-neutral-500 text-xs">
                {formatCommentDate(item.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-3">
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  placeholder="Modifiez votre commentaire"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveEdit(item.reviewId)}
                    disabled={updateComment.isPending || !editingText.trim()}
                    className="rounded-lg bg-white text-black px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingReviewId(null);
                      setEditingText("");
                    }}
                    className="rounded-lg border border-neutral-700 text-neutral-300 px-3 py-1.5 text-xs"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap">
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
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white"
              >
                <HiChatBubbleLeftRight size={14} />
                Repondre
              </button>
            )}
          </div>

          {isMine && !isEditing && (
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenedMenuId((previous) =>
                    previous === item.reviewId ? null : item.reviewId,
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <HiEllipsisHorizontal size={18} />
              </button>

              {openedMenuId === item.reviewId && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl border border-neutral-700 bg-neutral-900 p-1 shadow-xl z-10">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800"
                  >
                    <HiPencilSquare size={14} />
                    Editer
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.reviewId)}
                    className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-300 hover:bg-neutral-800"
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
    <div className="mt-20 pt-10 border-t border-neutral-900">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white tracking-tight">
          Avis de la communaute
        </h2>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-4 md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-300">Votre note</p>
              <p className="text-xs text-neutral-500">
                Une seule note par film, vous pouvez la modifier quand vous
                voulez.
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
                    className="rounded-md p-1 transition hover:bg-white/10 disabled:opacity-50"
                    aria-label={`Noter ${value} sur 5`}
                  >
                    <HiStar
                      size={24}
                      className={
                        value <= selectedRating
                          ? "text-amber-400"
                          : "text-neutral-600"
                      }
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Connectez-vous pour noter ce film.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/60 p-4 md:p-5">
          <label className="block text-sm text-neutral-300 mb-2">
            Partage ton avis
          </label>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={3}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            placeholder="Ecrire un commentaire..."
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void handleCreateComment()}
              disabled={
                createComment.isPending ||
                !newComment.trim() ||
                selectedRating === 0
              }
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              Publier
            </button>
          </div>
        </div>

        {(createComment.error ||
          upsertRating.error ||
          createReply.error ||
          updateComment.error ||
          deleteComment.error) && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200">
            Une erreur est survenue pendant l'operation sur les commentaires.
          </div>
        )}

        {reviewsLoading ? (
          <div className="text-center py-8 text-neutral-500">
            Chargement des avis...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/30 border border-neutral-800/50 rounded-2xl">
            <p className="text-neutral-500">
              Aucun avis pour le moment. Soyez le premier a commenter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.reviewId} className="space-y-3">
                {renderReviewRow(review, { canReply: true })}

                {replyTargetId === review.reviewId && (
                  <div className="ml-4 md:ml-10 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
                    <textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                      placeholder="Ecrire une reponse..."
                    />
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTargetId(null);
                          setReplyText("");
                        }}
                        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCreateReply(review.reviewId)}
                        disabled={createReply.isPending || !replyText.trim()}
                        className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                      >
                        Repondre
                      </button>
                    </div>
                  </div>
                )}

                {review.replies.length > 0 && (
                  <div className="ml-4 md:ml-10 space-y-3 border-l border-neutral-800 pl-4">
                    {review.replies.map((reply) =>
                      renderReviewRow(reply, { isReply: true }),
                    )}
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
