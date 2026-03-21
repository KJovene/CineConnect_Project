import { db } from "../db/index.js";
import { messages, user } from "../db/schema.js";
import { eq, or, and, asc, desc } from "drizzle-orm";

export interface IncomingMessageNotificationDto {
  message_id: number;
  sender_id: number;
  sender_name: string | null;
  sender_image: string | null;
  content: string;
  sent_at: Date | null;
}

export async function getConversation(
  userId: number,
  withUserId: number,
  page = 1,
  limit = 50,
) {
  const offset = (page - 1) * limit;

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
        and(
          eq(messages.sender_id, userId),
          eq(messages.receiver_id, withUserId),
        ),
        and(
          eq(messages.sender_id, withUserId),
          eq(messages.receiver_id, userId),
        ),
      ),
    )
    .orderBy(asc(messages.sent_at))
    .limit(limit)
    .offset(offset);
}

export async function createMessage(
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

export async function getRecentConversations(userId: number) {
  // Récupère le dernier message de chaque conversation
  const rows = await db
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

  // Déduplique par interlocuteur, garde uniquement le dernier message
  const seen = new Set<number>();
  const conversations: typeof rows = [];
  for (const row of rows) {
    const otherId = row.sender_id === userId ? row.receiver_id : row.sender_id;
    if (!seen.has(otherId)) {
      seen.add(otherId);
      conversations.push(row);
    }
  }

  return conversations;
}

export async function getIncomingMessages(
  userId: number,
  limit = 20,
): Promise<IncomingMessageNotificationDto[]> {
  const normalizedLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);

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
    .limit(normalizedLimit);
}
