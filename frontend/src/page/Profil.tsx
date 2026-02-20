import React, { useState } from "react";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "@tanstack/react-router";
import { FriendList } from "@/components/organisms";
import { SearchUserRow } from "@/components/molecules";
import { useSession } from "@/lib/auth-client";
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

const Profil: React.FC = () => {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const [search, setSearch] = useState("");

  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: pendingRequests = [] } = usePendingRequests();
  const { data: searchResults = [] } = useSearchUsers(search);

  const [requestError, setRequestError] = useState<string | null>(null);

  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const handleMessage = (friend: FriendUser) => {
    navigate({ to: "/discussion", search: { friendId: String(friend.id) } });
  };

  const currentUser = session?.user;

  return (
    <div className="px-8 pt-28 pb-8 max-w-3xl mx-auto">
      {/* Profil utilisateur */}
      <section className="mb-10">
        <div className="flex items-center gap-5 p-6 bg-[#0A0A0A] border border-white/5 rounded-2xl">
          <img
            src={
              currentUser?.image ??
              `https://i.pravatar.cc/150?u=${currentUser?.id}`
            }
            alt={currentUser?.name ?? ""}
            className="w-16 h-16 rounded-full ring-2 ring-indigo-500/30"
          />
          <div>
            <h1 className="text-xl font-bold text-white">
              {currentUser?.name ?? "Utilisateur"}
            </h1>
            <p className="text-sm text-neutral-500">{currentUser?.email}</p>
          </div>
        </div>
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
                    sendRequest.mutate(id, {
                      onError: (err) => setRequestError(err.message),
                    });
                  }}
                  isPending={sendRequest.isPending}
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
