import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';

const messageSchema = z.object({
  message_id: z.number(),
  sender_id: z.number(),
  receiver_id: z.number(),
  content: z.string(),
  sent_at: z.string().nullable(),
});

export type Message = z.infer<typeof messageSchema>;

export function useMessages(withUserId: number | null) {
  return useQuery({
    queryKey: ['messages', withUserId],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/messages/with/${withUserId}`);
      const parsed = z.array(messageSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[useMessages] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
    enabled: withUserId !== null,
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ receiverId, content }: { receiverId: number; content: string }) =>
      apiClient.post<Message>('/messages', { receiverId, content }),
  });
}

/** Envoie un message via Socket.io (temps réel). */
export function useSocketSend() {
  return useCallback((toUserId: number, content: string) => {
    getSocket().emit('dm:send', { toUserId, content });
  }, []);
}

/**
 * S'abonne aux nouveaux messages entrants via Socket.io.
 * Met à jour le cache TanStack Query pour la conversation concernée.
 */
export function useIncomingMessages(currentUserId: number | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const socket = getSocket();

    const handleNewMessage = ({ message }: { message: unknown }) => {
      const parsed = messageSchema.safeParse(message);
      if (!parsed.success) {
        console.error("[useIncomingMessages] Message socket invalide:", parsed.error);
        return;
      }
      const msg = parsed.data;
      const otherId =
        msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;

      qc.setQueryData<Message[]>(['messages', otherId], (old) => [
        ...(old ?? []),
        msg,
      ]);
    };

    socket.on('dm:new', handleNewMessage);
    return () => {
      socket.off('dm:new', handleNewMessage);
    };
  }, [currentUserId, qc]);
}
