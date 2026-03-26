import { and, asc, desc, eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { messages, user } from "../db/schema.js";

export async function findConversationMessages(
  userId: number,
  withUserId: number,
  limit: number,
  offset: number,
) {
  return db
    .select({
      message_id: messages.message_id,
      sender_id: messages.sender_id,
      receiver_id: messages.receiver_id,
      content: messages.content,
      sent_at: messages.sent_at,
    })
    .from(messages)
    .where(
      or(
        and(eq(messages.sender_id, userId), eq(messages.receiver_id, withUserId)),
        and(eq(messages.sender_id, withUserId), eq(messages.receiver_id, userId)),
      ),
    )
    .orderBy(asc(messages.sent_at))
    .limit(limit)
    .offset(offset);
}

export async function insertMessage(
  senderId: number,
  receiverId: number,
  content: string,
) {
  const [result] = await db
    .insert(messages)
    .values({ sender_id: senderId, receiver_id: receiverId, content })
    .returning();

  return result;
}

export async function findRecentConversationMessages(userId: number) {
  return db
    .select({
      message_id: messages.message_id,
      sender_id: messages.sender_id,
      receiver_id: messages.receiver_id,
      content: messages.content,
      sent_at: messages.sent_at,
    })
    .from(messages)
    .where(or(eq(messages.sender_id, userId), eq(messages.receiver_id, userId)))
    .orderBy(desc(messages.sent_at));
}

export async function findIncomingMessagesWithSender(userId: number, limit: number) {
  return db
    .select({
      message_id: messages.message_id,
      sender_id: messages.sender_id,
      sender_name: user.name,
      sender_image: user.image,
      content: messages.content,
      sent_at: messages.sent_at,
    })
    .from(messages)
    .innerJoin(user, eq(messages.sender_id, user.id))
    .where(eq(messages.receiver_id, userId))
    .orderBy(desc(messages.sent_at))
    .limit(limit);
}
