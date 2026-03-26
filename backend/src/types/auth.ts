import type { Request } from "express";

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
