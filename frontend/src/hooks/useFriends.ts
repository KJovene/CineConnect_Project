import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/apiClient";

const friendUserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
});

const userSearchResultSchema = friendUserSchema.extend({
  relationStatus: z.enum(["pending", "accepted", "rejected"]).nullable(),
});

const friendRelationSchema = z.object({
  friend_id: z.number(),
  user_id: z.number(),
  friend_user_id: z.number(),
  status: z.string(),
  created_at: z.string().nullable(),
  friend: friendUserSchema.nullable(),
});

const pendingRequestSchema = z.object({
  friend_id: z.number(),
  user_id: z.number(),
  friend_user_id: z.number(),
  status: z.string(),
  created_at: z.string().nullable(),
  requester: friendUserSchema.nullable(),
});

export type FriendUser = z.infer<typeof friendUserSchema>;
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
export type FriendRelation = z.infer<typeof friendRelationSchema>;
export type PendingRequest = z.infer<typeof pendingRequestSchema>;

export function useFriends() {
  return useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>("/friends");
      const parsed = z.array(friendRelationSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[useFriends] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ["friends", "pending"],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>("/friends/pending");
      const parsed = z.array(pendingRequestSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[usePendingRequests] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
  });
}

export function useSearchUsers(search: string) {
  return useQuery({
    queryKey: ["users", "search", search],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/users?search=${encodeURIComponent(search)}`,
      );
      const parsed = z.array(userSearchResultSchema).safeParse(raw);
      if (!parsed.success) {
        console.error("[useSearchUsers] Réponse invalide:", parsed.error);
        throw new Error("Réponse API invalide");
      }
      return parsed.data;
    },
    enabled: search.length >= 2,
  });
}

export function useSendFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post("/friends/request", { friendUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["users", "search"] });
    },
  });
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post("/friends/accept", { friendUserId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      qc.invalidateQueries({ queryKey: ["friends", "pending"] });
    },
  });
}

export function useRejectFriendRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.post("/friends/reject", { friendUserId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends", "pending"] }),
  });
}

export function useRemoveFriend() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (friendUserId: number) =>
      apiClient.delete(`/friends/${friendUserId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["friends"] }),
  });
}
