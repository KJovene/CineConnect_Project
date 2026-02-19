import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface FriendUser {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
}

export interface UserSearchResult extends FriendUser {
  relationStatus: 'pending' | 'accepted' | 'rejected' | null;
}

export interface FriendRelation {
  friend_id: number;
  user_id: number;
  friend_user_id: number;
  status: string;
  created_at: string | null;
  friend: FriendUser | null;
}

export interface PendingRequest {
  friend_id: number;
  user_id: number;
  friend_user_id: number;
  status: string;
  created_at: string | null;
  requester: FriendUser | null;
}

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => apiClient.get<FriendRelation[]>('/friends'),
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['friends', 'pending'],
    queryFn: () => apiClient.get<PendingRequest[]>('/friends/pending'),
  });
}

export function useSearchUsers(search: string) {
  return useQuery({
    queryKey: ['users', 'search', search],
    queryFn: () => apiClient.get<UserSearchResult[]>(`/users?search=${encodeURIComponent(search)}`),
    enabled: search.length >= 2,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post('/friends/request', { friendUserId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post('/friends/accept', { friendUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['friends', 'pending'] });
    },
  });
}

export function useRejectFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post('/friends/reject', { friendUserId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends', 'pending'] }),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.delete(`/friends/${friendUserId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends'] }),
  });
}
