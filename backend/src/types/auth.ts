import type { User } from "@cineconnect/shared";

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest {
  user?: User;
  userId?: string;
}
