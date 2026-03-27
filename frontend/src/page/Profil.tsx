import React, { useRef, useState } from "react";
import { HiMagnifyingGlass, HiPencilSquare } from "react-icons/hi2";
import { useNavigate } from "@tanstack/react-router";
import { Avatar } from "@/components/atoms";
import {
  FriendList,
  ProfileLatestComments,
  ProfileLatestRatings,
} from "@/components/organisms";
import {
  DangerDeleteAccountSection,
  DangerPasswordSection,
  ProfileNameEditor,
  SearchUserRow,
} from "@/components/molecules";
import {
  changeCurrentUserPassword,
  deleteCurrentUser,
  getSession,
  signOut,
  updateCurrentUser,
  useSession,
} from "@/lib/auth-client";
import {
  useFriends,
  usePendingRequests,
  useSearchUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  type FriendUser,
  type UserSearchResult,
} from "@/hooks/useFriends";
import { useMyLatestComments, useMyLatestRatings } from "@/hooks/useReviews";

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [search, setSearch] = useState("");
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: pendingRequests = [] } = usePendingRequests();
  const { data: searchResults = [] } = useSearchUsers(search);
  const { data: latestRatings = [], isLoading: latestRatingsLoading } =
    useMyLatestRatings();
  const { data: latestComments = [], isLoading: latestCommentsLoading } =
    useMyLatestComments();

  const [requestError, setRequestError] = useState<string | null>(null);
  const [sentRequestIds, setSentRequestIds] = useState<Set<number>>(new Set());
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleMessage = (friend: FriendUser) => {
    navigate({ to: "/discussion", search: { friendId: String(friend.id) } });
  };

  const handleRemoveFriend = (friend: FriendUser) => {
    const shouldRemove = window.confirm(
      `Retirer ${friend.name ?? "cet utilisateur"} de vos amis ?`,
    );
    if (!shouldRemove) return;
    removeFriend.mutate(friend.id);
  };

  const currentUser = session?.user;

  const formatDate = (dateLike?: string | Date) => {
    if (!dateLike) return "-";
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleOpenFilm = (omdbId: string) => {
    if (!omdbId) return;
    navigate({ to: "/film/$id", params: { id: omdbId } });
  };

  const handleChoosePhoto = () => imageInputRef.current?.click();

  const handleResetProfileFeedback = () => {
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleUpdateName = async (nextName: string) => {
    handleResetProfileFeedback();
    setIsUpdatingName(true);

    try {
      await updateCurrentUser({ name: nextName });
      await getSession();
      setProfileSuccess("Pseudo mis à jour.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mise à jour impossible";
      setProfileError(message);
      throw new Error(message);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleResetProfileFeedback();

    if (!file.type.startsWith("image/")) {
      setProfileError("Sélectionnez uniquement une image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Image trop volumineuse (max 2 Mo).");
      e.target.value = "";
      return;
    }

    setIsUpdatingPhoto(true);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }
          reject(new Error("Format image invalide"));
        };
        reader.onerror = () =>
          reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });

      await updateCurrentUser({ image: base64Image });
      await getSession();
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "Mise à jour impossible",
      );
    } finally {
      setIsUpdatingPhoto(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await changeCurrentUserPassword(payload);
    await getSession();
  };

  const handleDeleteAccount = async () => {
    await deleteCurrentUser();

    try {
      await signOut();
    } catch {
      // Le compte peut deja etre supprime cote serveur.
    }

    navigate({ to: "/login" });
  };

  return (
    <div className="px-8 pt-28 pb-8 max-w-3xl mx-auto">
      {/* Profil utilisateur */}
      <section className="mb-10">
        <div
          className="p-6 rounded-2xl space-y-6"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="shrink-0 relative">
              <Avatar
                image={currentUser?.image ?? null}
                name={currentUser?.name ?? "Utilisateur"}
                size="xl"
              />
              <button
                type="button"
                onClick={handleChoosePhoto}
                disabled={isUpdatingPhoto}
                className="absolute -top-1 -right-1 z-10 p-1.5 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-500/20 cursor-pointer"
                style={{
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  background: "var(--color-surface)",
                }}
                aria-label="Modifier la photo de profil"
                title={isUpdatingPhoto ? "Mise à jour..." : "Modifier la photo"}
              >
                <HiPencilSquare size={14} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <ProfileNameEditor
                currentName={currentUser?.name ?? "Utilisateur"}
                isSaving={isUpdatingName}
                onSave={handleUpdateName}
                onResetFeedback={handleResetProfileFeedback}
              />
              <p
                className="text-sm truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                {currentUser?.email}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                Membre depuis {formatDate(currentUser?.createdAt)}
              </p>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {profileError && (
            <p className="text-xs text-rose-400">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="text-xs text-emerald-400">{profileSuccess}</p>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { label: "Pseudo", value: currentUser?.name ?? "Utilisateur" },
              { label: "Amis", value: friends.length },
              { label: "Notes", value: latestRatings.length },
              { label: "Commentaires", value: latestComments.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </p>
                <p
                  className="text-sm mt-1 truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4">
        <ProfileLatestRatings
          ratings={latestRatings}
          isLoading={latestRatingsLoading}
          onOpenFilm={handleOpenFilm}
        />
        <ProfileLatestComments
          comments={latestComments}
          isLoading={latestCommentsLoading}
          onOpenFilm={handleOpenFilm}
        />
      </section>

      {/* Recherche d'amis */}
      <section className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Ajouter un ami
        </h2>
        <div className="relative mb-4">
          <HiMagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          />
        </div>

        {requestError && (
          <p className="text-xs text-rose-400 mb-2">{requestError}</p>
        )}

        {search.length >= 2 && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                Aucun résultat
              </p>
            ) : (
              searchResults.map((u: UserSearchResult) => (
                <SearchUserRow
                  key={u.id}
                  user={u}
                  onAdd={(id) => {
                    setRequestError(null);
                    setSentRequestIds((prev) => new Set(prev).add(id));
                    sendRequest.mutate(id, {
                      onError: (err) => {
                        setSentRequestIds((prev) => {
                          const next = new Set(prev);
                          next.delete(id);
                          return next;
                        });
                        setRequestError(err.message);
                      },
                    });
                  }}
                  isPending={sendRequest.isPending}
                  requestSent={sentRequestIds.has(u.id)}
                />
              ))
            )}
          </div>
        )}
      </section>

      {/* Liste des amis */}
      <section id="friends-section" className="scroll-mt-28">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          Mes amis
        </h2>
        <FriendList
          friends={friends}
          pendingRequests={pendingRequests}
          isLoading={friendsLoading}
          onAccept={(uid) => acceptRequest.mutate(uid)}
          onReject={(uid) => rejectRequest.mutate(uid)}
          onRemove={handleRemoveFriend}
          onMessage={handleMessage}
        />
      </section>

      <section className="mt-10">
        <div
          className="p-6 rounded-2xl space-y-6"
          style={{
            background: "var(--danger-surface)",
            border: "1px solid var(--danger-border)",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--danger-title)" }}
          >
            Danger
          </h2>
          <DangerPasswordSection onChangePassword={handleChangePassword} />
          <DangerDeleteAccountSection onDeleteAccount={handleDeleteAccount} />
        </div>
      </section>
    </div>
  );
};

export default Profil;
