import { db } from '../db/index.js';
import { friends, user } from '../db/schema.js';
import { eq, or, and, inArray } from 'drizzle-orm';

export async function getFriends(userId: number) {
  const rows = await db
    .select({
      friend_id: friends.friend_id,
      user_id: friends.user_id,
      friend_user_id: friends.friend_user_id,
      status: friends.status,
      created_at: friends.created_at,
    })
    .from(friends)
    .where(
      and(
        or(eq(friends.user_id, userId), eq(friends.friend_user_id, userId)),
        eq(friends.status, 'accepted')
      )
    );

  if (rows.length === 0) return [];

  const otherIds = rows.map((r) =>
    r.user_id === userId ? r.friend_user_id : r.user_id
  );

  const users = await db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image })
    .from(user)
    .where(inArray(user.id, otherIds));

  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => {
    const otherId = r.user_id === userId ? r.friend_user_id : r.user_id;
    return { ...r, friend: userMap.get(otherId) ?? null };
  });
}

export async function getPendingRequests(userId: number) {
  const rows = await db
    .select({
      friend_id: friends.friend_id,
      user_id: friends.user_id,
      friend_user_id: friends.friend_user_id,
      status: friends.status,
      created_at: friends.created_at,
    })
    .from(friends)
    .where(
      and(eq(friends.friend_user_id, userId), eq(friends.status, 'pending'))
    );

  if (rows.length === 0) return [];

  const requesterIds = rows.map((r) => r.user_id);
  const users = await db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image })
    .from(user)
    .where(inArray(user.id, requesterIds));

  const userMap = new Map(users.map((u) => [u.id, u]));

  return rows.map((r) => ({ ...r, requester: userMap.get(r.user_id) ?? null }));
}

export async function sendFriendRequest(userId: number, friendUserId: number) {
  if (userId === friendUserId) throw new Error('Impossible de s\'ajouter soi-même');

  const existing = await db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.user_id, userId), eq(friends.friend_user_id, friendUserId)),
        and(eq(friends.user_id, friendUserId), eq(friends.friend_user_id, userId))
      )
    );

  if (existing.length > 0) throw new Error('Relation déjà existante');

  const [result] = await db
    .insert(friends)
    .values({ user_id: userId, friend_user_id: friendUserId, status: 'pending' })
    .returning();

  return result;
}

export async function acceptFriendRequest(userId: number, friendUserId: number) {
  const [result] = await db
    .update(friends)
    .set({ status: 'accepted' })
    .where(
      and(
        eq(friends.user_id, friendUserId),
        eq(friends.friend_user_id, userId),
        eq(friends.status, 'pending')
      )
    )
    .returning();

  if (!result) throw new Error('Demande introuvable');
  return result;
}

export async function rejectFriendRequest(userId: number, friendUserId: number) {
  const [result] = await db
    .update(friends)
    .set({ status: 'rejected' })
    .where(
      and(
        eq(friends.user_id, friendUserId),
        eq(friends.friend_user_id, userId),
        eq(friends.status, 'pending')
      )
    )
    .returning();

  if (!result) throw new Error('Demande introuvable');
  return result;
}

export async function removeFriend(userId: number, friendUserId: number) {
  await db.delete(friends).where(
    or(
      and(eq(friends.user_id, userId), eq(friends.friend_user_id, friendUserId)),
      and(eq(friends.user_id, friendUserId), eq(friends.friend_user_id, userId))
    )
  );
}
