import React, { useRef, useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "@tanstack/react-router";
import { Avatar } from "@/components/atoms";
import {
  FriendList,
  ProfileLatestComments,
  ProfileLatestRatings,
} from "@/components/organisms";
import { SearchUserRow } from "@/components/molecules";
import { getSession, updateCurrentUser, useSession } from "@/lib/auth-client";
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
} from "@/features/friends/hooks";
import {
  useMyLatestComments,
  useMyLatestRatings,
} from "@/features/reviews/hooks";

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
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleMessage = (friend: FriendUser) => {
    navigate({ to: "/discussion", search: { friendId: String(friend.id) } });
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

  const handleChoosePhoto = () => {
    imageInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError(null);

    if (!file.type.startsWith("image/")) {
      setProfileError("Selectionnez uniquement une image.");
      e.target.value = "";
      return;
    }

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
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
      const message =
        error instanceof Error ? error.message : "Mise a jour impossible";
      setProfileError(message);
    } finally {
      setIsUpdatingPhoto(false);
      e.target.value = "";
    }
  };

  return (
    <div className="px-8 pt-28 pb-8 max-w-3xl mx-auto">
      {/* Profil utilisateur */}
      <section className="mb-10">
        <div className="p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="shrink-0">
              <Avatar
                image={currentUser?.image ?? null}
                name={currentUser?.name ?? "Utilisateur"}
                size="xl"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">
                {currentUser?.name ?? "Utilisateur"}
              </h1>
              <p className="text-sm text-neutral-500 truncate">
                {currentUser?.email}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Membre depuis {formatDate(currentUser?.createdAt)}
              </p>
            </div>

            <div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleChoosePhoto}
                disabled={isUpdatingPhoto}
                className="px-4 py-2 text-sm rounded-xl border border-white/10 text-neutral-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdatingPhoto ? "Mise a jour..." : "Changer la photo"}
              </button>
            </div>
          </div>

          {profileError && (
            <p className="text-xs text-rose-400">{profileError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Pseudo
              </p>
              <p className="text-sm text-neutral-100 mt-1 truncate">
                {currentUser?.name ?? "Utilisateur"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Amis
              </p>
              <p className="text-sm text-neutral-100 mt-1">{friends.length}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Notes
              </p>
              <p className="text-sm text-neutral-100 mt-1">
                {latestRatings.length}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Commentaires
              </p>
              <p className="text-sm text-neutral-100 mt-1">
                {latestComments.length}
              </p>
            </div>
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
        <h2 className="text-lg font-semibold text-white mb-4">
          Ajouter un ami
        </h2>
        <div className="relative mb-4">
          <HiMagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {requestError && (
          <p className="text-xs text-rose-400 mb-2">{requestError}</p>
        )}

        {search.length >= 2 && (
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-neutral-600 text-center py-4">
                Aucun résultat
              </p>
            ) : (
              searchResults.map((u: UserSearchResult) => (
                <SearchUserRow
                  key={u.id}
                  user={u}
                  onAdd={(id) => {
                    setRequestError(null);
                    setSentRequestIds((previous) => new Set(previous).add(id));
                    sendRequest.mutate(id, {
                      onError: (err) => {
                        setSentRequestIds((previous) => {
                          const next = new Set(previous);
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
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Mes amis</h2>
        <FriendList
          friends={friends}
          pendingRequests={pendingRequests}
          isLoading={friendsLoading}
          onAccept={(uid) => acceptRequest.mutate(uid)}
          onReject={(uid) => rejectRequest.mutate(uid)}
          onRemove={(uid) => removeFriend.mutate(uid)}
          onMessage={handleMessage}
        />
      </section>
    </div>
  );
};

export default Profil;
