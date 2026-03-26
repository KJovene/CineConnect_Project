import type { Request } from "express";
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

export interface AuthSession {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  session: { id: string; userId: string; token: string; expiresAt: Date };
}

export interface RequestWithSession extends Request {
  session?: AuthSession | null;
}
