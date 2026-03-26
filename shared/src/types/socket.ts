import { z } from "zod";
import { reviewResponseSchema } from "./reviews";

export const socketUserOnlineSchema = z.object({ userId: z.string() });
export const socketUserOfflineSchema = z.object({ userId: z.string() });
export const socketReviewDeletedSchema = z.object({ reviewId: z.string() });

// Les payloads des événements Socket.io avec validation
export const socketEventSchemas = {
  "user:online": socketUserOnlineSchema,
  "user:offline": socketUserOfflineSchema,
  "review:created": reviewResponseSchema,
  "review:updated": reviewResponseSchema,
  "review:deleted": socketReviewDeletedSchema,
};

// Type utilisé côté TypeScript pour typer les handlers Socket.io
export interface SocketEvents {
  "user:online": z.infer<typeof socketUserOnlineSchema>;
  "user:offline": z.infer<typeof socketUserOfflineSchema>;
  "review:created": z.infer<typeof reviewResponseSchema>;
  "review:updated": z.infer<typeof reviewResponseSchema>;
  "review:deleted": z.infer<typeof socketReviewDeletedSchema>;
}
