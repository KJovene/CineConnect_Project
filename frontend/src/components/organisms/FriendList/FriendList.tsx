import {
  HiUserPlus,
  HiCheck,
  HiXMark,
  HiChatBubbleLeftRight,
  HiUserMinus,
} from "react-icons/hi2";
import { Avatar } from "@/components/atoms";
import type {
  FriendRelation,
  PendingRequest,
  FriendUser,
} from "@/hooks/useFriends";

export interface FriendListProps {
  friends: FriendRelation[];
  pendingRequests: PendingRequest[];
  isLoading?: boolean;
  onAccept: (userId: number) => void;
  onReject: (userId: number) => void;
  onRemove: (friend: FriendUser) => void;
  onMessage?: (friend: FriendUser) => void;
}

export function FriendList({
  friends,
  pendingRequests,
  isLoading,
  onAccept,
  onReject,
  onRemove,
  onMessage,
}: FriendListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{ background: "var(--color-surface)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <section>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--color-text-muted)" }}
          >
            Demandes reçues ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.friend_id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    image={req.requester?.image ?? null}
                    name={req.requester?.name ?? null}
                  />
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text)" }}
                    >
                      {req.requester?.name ?? "Utilisateur inconnu"}
                    </div>
                    <div
                      className="text-[11px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {req.requester?.email}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Boutons accept/reject — couleurs sémantiques, gardées */}
                  <button
                    onClick={() => onAccept(req.user_id)}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                    title="Accepter"
                  >
                    <HiCheck size={16} />
                  </button>
                  <button
                    onClick={() => onReject(req.user_id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                    title="Refuser"
                  >
                    <HiXMark size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amis acceptés */}
      <section>
        <h3
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          Amis ({friends.length})
        </h3>

        {friends.length === 0 ? (
          <div
            className="text-center py-10"
            style={{ color: "var(--color-text-muted)" }}
          >
            <HiUserPlus size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun ami pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((rel) => {
              const friend = rel.friend;
              if (!friend) return null;

              return (
                <div
                  key={rel.friend_id}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors group"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      image={friend.image ?? null}
                      name={friend.name ?? null}
                    />
                    <div>
                      <div
                        className="text-sm font-medium group-hover:text-indigo-400 transition-colors"
                        style={{ color: "var(--color-text)" }}
                      >
                        {friend.name ?? "Utilisateur"}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {friend.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onMessage && (
                      <button
                        onClick={() => onMessage(friend)}
                        className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors cursor-pointer"
                        style={{ color: "var(--color-text-muted)" }}
                        title="Envoyer un message"
                      >
                        <HiChatBubbleLeftRight size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => onRemove(friend)}
                      className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                      style={{ color: "var(--color-text-muted)" }}
                      title="Retirer de mes amis"
                    >
                      <HiUserMinus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
