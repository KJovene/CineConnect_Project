import {
  findConversationMessages,
  findIncomingMessagesWithSender,
  findRecentConversationMessages,
  insertMessage,
} from "../repositories/messagesRepository.js";

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

  return findConversationMessages(userId, withUserId, limit, offset);
}

export async function createMessage(
  senderId: number,
  receiverId: number,
  content: string,
) {
  return insertMessage(senderId, receiverId, content);
}

export async function getRecentConversations(userId: number) {
  // Récupère le dernier message de chaque conversation
  const rows = await findRecentConversationMessages(userId);

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

  return findIncomingMessagesWithSender(userId, normalizedLimit);
}
