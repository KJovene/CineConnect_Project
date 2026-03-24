import type { ReviewResponse } from "./reviews";

export interface SocketEvents {
  "user:online": { userId: string };
  "user:offline": { userId: string };
  "review:created": ReviewResponse;
  "review:updated": ReviewResponse;
  "review:deleted": { reviewId: string };
}
