import React, { useMemo, useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import {
  HiArrowLeft,
  HiBell,
  HiPlay,
  HiPencil,
  HiPencilSquare,
  HiBookmark,
  HiStar,
  HiEllipsisHorizontal,
  HiTrash,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { useMovieDetails } from "@/hooks/useMovieDetails";
import { getPosterUrl, handlePosterError } from "@/features/media/utils/poster";
import {
  type FilmReviewComment,
  type ReviewReply,
  useCreateFilmComment,
  useCreateFilmReply,
  useDeleteFilmComment,
  useFilmReviews,
  useUpdateFilmComment,
} from "@/features/reviews/hooks";
import { useSession } from "@/lib/auth-client";

type ReviewItem = FilmReviewComment | ReviewReply;

function formatCommentDate(value: string | null): string {
  if (!value) return "Date inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const FilmDetailPage: React.FC = () => {
  //récupérer l'id depuis l'url
  const { id } = useParams({ from: "/_authenticated/film/$id" });
  const { data: session } = useSession();

  const { data: movie, isLoading, error } = useMovieDetails(id);
  const { data: reviews = [], isLoading: reviewsLoading } = useFilmReviews(id);
  const createComment = useCreateFilmComment(id);
  const createReply = useCreateFilmReply(id);
  const updateComment = useUpdateFilmComment(id);
  const deleteComment = useDeleteFilmComment(id);

  const currentUserId = useMemo(() => {
    const rawId = session?.user?.id;
    if (!rawId) return null;
    const parsed = Number.parseInt(rawId, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }, [session?.user?.id]);

  const [newComment, setNewComment] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [openedMenuId, setOpenedMenuId] = useState<number | null>(null);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !movie) {
    return <ErrorState error={error} />;
  }

  //parsing des données de détails du film
  const genres: string[] = movie.genre ? movie.genre.split(", ") : [];

  const handleCreateComment = async () => {
    const comment = newComment.trim();
    if (!comment) return;

    await createComment.mutateAsync({ comment });
    setNewComment("");
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
          <img
            src={
              item.author.image ??
              `https://i.pravatar.cc/100?u=${item.author.id}`
            }
            alt={item.author.name}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
          />

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
                Répondre
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
    <div className="bg-[#050505] text-neutral-300 antialiased min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 fixed top-0 w-full z-50 bg-linear-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Bouton retour */}
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <HiArrowLeft size={20} className="text-white" />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative text-neutral-300 hover:text-white transition-colors">
            <HiBell size={22} />
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="https://i.pravatar.cc/150?img=33"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
            />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full pb-20">
        {/* Image horizontale */}
        <div className="relative w-full h-[60vh] lg:h-[65vh]">
          <img
            src={getPosterUrl(movie.poster_url)}
            className="w-full h-full object-cover object-center"
            alt={movie.title}
            onError={handlePosterError}
          />

          <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-linear-to-r from-black/40 to-transparent"></div>
        </div>

        {/* CONTENU DÉTAILS */}
        <div className="relative z-10 -mt-32 w-full max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1 space-y-8">
              {/* Titre */}
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

                  {/* Note IMDb */}
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

              {/* Boutons d'action */}
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-semibold hover:bg-neutral-200 transition-all active:scale-95">
                  <HiPlay size={20} />
                  Lecture
                </button>
                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/10 px-6 py-3.5 rounded-xl font-medium hover:bg-white/20 transition-all active:scale-95">
                  <HiPencil size={20} />
                  Écrire mon avis
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-xl border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 transition-all ml-auto lg:ml-0">
                  <HiBookmark size={20} />
                </button>
              </div>

              {/* Synopsis */}
              <div className="max-w-3xl">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  Résumé
                </h3>
                <p className="text-lg text-neutral-300 leading-relaxed">
                  {movie.plot ? movie.plot : "Aucun synopsis disponible."}
                </p>
              </div>

              {/* Détails techniques */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-neutral-800/50">
                {movie.director && (
                  <div>
                    <h4 className="text-xs text-neutral-500 mb-1">
                      Réalisateur
                    </h4>
                    <p className="text-white font-medium">{movie.director}</p>
                  </div>
                )}
                {movie.awards && (
                  <div>
                    <h4 className="text-xs text-neutral-500 mb-1">
                      Récompenses
                    </h4>
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

              {/* Type de média */}
              {movie.type && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                    Type
                  </h3>
                  <p className="text-neutral-300 capitalize">
                    {movie.type === "movie"
                      ? "Film"
                      : movie.type === "series"
                        ? "Série"
                        : movie.type}
                  </p>
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:w-12"></div>
          </div>

          {/* SECTION AVIS */}
          <div className="mt-20 pt-10 border-t border-neutral-900">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Avis de la communauté
              </h2>
            </div>

            <div className="space-y-6">
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
                    disabled={createComment.isPending || !newComment.trim()}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    Publier
                  </button>
                </div>
              </div>

              {(createComment.error ||
                createReply.error ||
                updateComment.error ||
                deleteComment.error) && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-200">
                  Une erreur est survenue pendant l'opération sur les
                  commentaires.
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
                            onChange={(event) =>
                              setReplyText(event.target.value)
                            }
                            rows={2}
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            placeholder="Ecrire une réponse..."
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
                              onClick={() =>
                                void handleCreateReply(review.reviewId)
                              }
                              disabled={
                                createReply.isPending || !replyText.trim()
                              }
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
        </div>
      </main>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen">
      <div className="h-20 bg-neutral-900/50"></div>
      <div className="w-full h-[65vh] bg-neutral-900/50 animate-pulse"></div>
      <div className="max-w-6xl mx-auto px-12 -mt-32">
        <div className="space-y-4">
          <div className="h-12 bg-neutral-900/50 rounded animate-pulse w-1/2"></div>
          <div className="h-6 bg-neutral-900/50 rounded animate-pulse w-1/4"></div>
          <div className="h-32 bg-neutral-900/50 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ error: Error | null }> = ({ error }) => {
  return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Film introuvable</h1>
        <p className="text-neutral-400 mb-8">
          {error?.message || "Ce film n'existe pas ou a été supprimé."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
        >
          <HiArrowLeft size={20} />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default FilmDetailPage;
