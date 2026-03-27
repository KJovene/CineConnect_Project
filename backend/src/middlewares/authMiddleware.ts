import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import type { RequestWithSession } from "../types/index.js";

export type { RequestWithSession };

/** Convertit IncomingHttpHeaders en Headers (Web API) pour Better Auth. */
function toHeaders(
  h: Request["headers"],
): InstanceType<typeof globalThis.Headers> {
  const headers = new Headers();
  for (const [k, v] of Object.entries(h)) {
    if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }
  return headers;
}

/**
 * Middleware qui attache la session Better Auth à la requête (req.session).
 * N'envoie pas 401 si non connecté : à utiliser avec requireAuth pour les routes protégées.
 */
export async function attachSession(
  req: RequestWithSession,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw = await auth.api.getSession({ headers: toHeaders(req.headers) });
    if (!raw) {
      req.session = null;
      return next();
    }
    req.session = {
      user: { ...raw.user, image: raw.user.image ?? null },
      session: raw.session,
    };
  } catch {
    req.session = null;
  }
  next();
}

/**
 * Middleware qui exige une session. Renvoie 401 si l'utilisateur n'est pas connecté.
 */
export function requireAuth(
  req: RequestWithSession,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session?.user) {
    res.status(401).json({ error: "Non authentifié" });
    return;
  }
  next();
}
