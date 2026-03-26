import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string | null;
}

export function useMessages(withUserId: number | null) {
  return useQuery({
    queryKey: ['messages', withUserId],
    queryFn: () => apiClient.get<Message[]>(`/messages/with/${withUserId}`),
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

    const handleNewMessage = ({ message }: { message: Message }) => {
      const otherId =
        message.sender_id === currentUserId
          ? message.receiver_id
          : message.sender_id;

      qc.setQueryData<Message[]>(['messages', otherId], (old) => [
        ...(old ?? []),
        message,
      ]);
    };

    socket.on('dm:new', handleNewMessage);
    return () => {
      socket.off('dm:new', handleNewMessage);
    };
  }, [currentUserId, qc]);
}
