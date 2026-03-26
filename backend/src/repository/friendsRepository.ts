import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { friends, user } from "../db/schema.js";

export async function findAcceptedRelationsByUserId(userId: number) {
  return db
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
        eq(friends.status, "accepted"),
      ),
    );
}

export async function findPendingRelationsForReceiver(userId: number) {
  return db
    .select({
      friend_id: friends.friend_id,
      user_id: friends.user_id,
      friend_user_id: friends.friend_user_id,
      status: friends.status,
      created_at: friends.created_at,
    })
    .from(friends)
    .where(
      and(eq(friends.friend_user_id, userId), eq(friends.status, "pending")),
    );
}

export async function findUsersByIds(userIds: number[]) {
  if (userIds.length === 0) return [];

  return db
    .select({ id: user.id, name: user.name, email: user.email, image: user.image })
    .from(user)
    .where(inArray(user.id, userIds));
}

export async function findExistingRelation(userId: number, friendUserId: number) {
  return db
    .select()
    .from(friends)
    .where(
      or(
        and(eq(friends.user_id, userId), eq(friends.friend_user_id, friendUserId)),
        and(eq(friends.user_id, friendUserId), eq(friends.friend_user_id, userId)),
      ),
    );
}

export async function createPendingRelation(userId: number, friendUserId: number) {
  const [result] = await db
    .insert(friends)
    .values({ user_id: userId, friend_user_id: friendUserId, status: "pending" })
    .returning();

  return result;
}

export async function updatePendingRelationStatus(
  userId: number,
  friendUserId: number,
  status: "accepted" | "rejected",
) {
  const [result] = await db
    .update(friends)
    .set({ status })
    .where(
      and(
        eq(friends.user_id, friendUserId),
        eq(friends.friend_user_id, userId),
        eq(friends.status, "pending"),
      ),
    )
    .returning();

  return result;
}

export async function deleteRelation(userId: number, friendUserId: number) {
  await db.delete(friends).where(
    or(
      and(eq(friends.user_id, userId), eq(friends.friend_user_id, friendUserId)),
      and(eq(friends.user_id, friendUserId), eq(friends.friend_user_id, userId)),
    ),
  );
}
