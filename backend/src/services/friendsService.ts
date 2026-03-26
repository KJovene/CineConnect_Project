import {
  createPendingRelation,
  deleteRelation,
  findAcceptedRelationsByUserId,
  findExistingRelation,
  findPendingRelationsForReceiver,
  findUsersByIds,
  updatePendingRelationStatus,
} from "../repository/friendsRepository.js";

export async function getFriends(userId: number) {
  const rows = await findAcceptedRelationsByUserId(userId);

  if (rows.length === 0) return [];

  const otherIds = rows.map((r) =>
    r.user_id === userId ? r.friend_user_id : r.user_id,
  );

  const users = await findUsersByIds(otherIds);

  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => {
    const otherId = r.user_id === userId ? r.friend_user_id : r.user_id;
    return { ...r, friend: userMap.get(otherId) ?? null };
  });
}

export async function getPendingRequests(userId: number) {
  const rows = await findPendingRelationsForReceiver(userId);

  if (rows.length === 0) return [];

  const requesterIds = rows.map((r) => r.user_id);
  const users = await findUsersByIds(requesterIds);

  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => ({ ...r, requester: userMap.get(r.user_id) ?? null }));
}

export async function sendFriendRequest(userId: number, friendUserId: number) {
  if (userId === friendUserId)
    throw new Error("Impossible de s'ajouter soi-même");

  const existing = await findExistingRelation(userId, friendUserId);

  if (existing.length > 0) throw new Error("Relation déjà existante");

  return createPendingRelation(userId, friendUserId);
}

export async function acceptFriendRequest(
  userId: number,
  friendUserId: number,
) {
  const result = await updatePendingRelationStatus(
    userId,
    friendUserId,
    "accepted",
  );

  if (!result) throw new Error("Demande introuvable");
  return result;
}

export async function rejectFriendRequest(
  userId: number,
  friendUserId: number,
) {
  const result = await updatePendingRelationStatus(
    userId,
    friendUserId,
    "rejected",
  );

  if (!result) throw new Error("Demande introuvable");
  return result;
}

export async function removeFriend(userId: number, friendUserId: number) {
  await deleteRelation(userId, friendUserId);
}
