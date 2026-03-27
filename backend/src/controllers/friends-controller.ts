import type { Response } from "express";
import { eq } from "drizzle-orm";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import * as friendsService from "../services/friends/friendsService.js";
import { db } from "../db/index.js";
import { user as userTable } from "../db/schema.js";
import { sendMail } from "../services/mailerService.js";
import {
  friendRequestTemplate,
  friendRequestAcceptedTemplate,
} from "../utils/emailTemplates.js";

export async function getFriends(req: RequestWithSession, res: Response) {
  try {
    const userId = parseInt(req.session!.user.id, 10);
    const data = await friendsService.getFriends(userId);
    res.json(data);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getPendingRequests(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const userId = parseInt(req.session!.user.id, 10);
    const data = await friendsService.getPendingRequests(userId);
    res.json(data);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function sendFriendRequest(
  req: RequestWithSession,
  res: Response,
) {
  const rawId = req.session!.user.id;
  const userId = parseInt(String(rawId), 10);
  const { friendUserId } = req.body as { friendUserId: unknown };

  if (Number.isNaN(userId)) {
    res.status(400).json({ error: `ID de session invalide : ${rawId}` });
    return;
  }

  const friendId =
    typeof friendUserId === "number"
      ? friendUserId
      : parseInt(String(friendUserId), 10);

  if (!friendId || Number.isNaN(friendId)) {
    res.status(400).json({ error: "friendUserId invalide ou manquant" });
    return;
  }

  try {
    const result = await friendsService.sendFriendRequest(userId, friendId);
    res.status(201).json(result);

    const [recipient] = await db
      .select({ name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, friendId));
    if (recipient) {
      const frontendUrl = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
      const senderName = req.session!.user.name || req.session!.user.email;
      const { subject, html } = friendRequestTemplate(
        recipient.name || recipient.email,
        senderName,
        frontendUrl,
      );
      await sendMail({ to: recipient.email, subject, html });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ error: message });
  }
}

export async function acceptFriendRequest(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const userId = parseInt(req.session!.user.id, 10);
    const { friendUserId } = req.body as { friendUserId: number };

    if (!friendUserId) {
      res.status(400).json({ error: "friendUserId requis" });
      return;
    }

    const result = await friendsService.acceptFriendRequest(
      userId,
      friendUserId,
    );
    res.json(result);

    const [requester] = await db
      .select({ name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(eq(userTable.id, friendUserId));
    if (requester) {
      const frontendUrl = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
      const acceptorName = req.session!.user.name || req.session!.user.email;
      const { subject, html } = friendRequestAcceptedTemplate(
        requester.name || requester.email,
        acceptorName,
        frontendUrl,
      );
      await sendMail({ to: requester.email, subject, html });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ error: message });
  }
}

export async function rejectFriendRequest(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const userId = parseInt(req.session!.user.id, 10);
    const { friendUserId } = req.body as { friendUserId: number };

    if (!friendUserId) {
      res.status(400).json({ error: "friendUserId requis" });
      return;
    }

    const result = await friendsService.rejectFriendRequest(
      userId,
      friendUserId,
    );
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(400).json({ error: message });
  }
}

export async function removeFriend(req: RequestWithSession, res: Response) {
  try {
    const userId = parseInt(req.session!.user.id, 10);
    const friendUserId = parseInt(String(req.params.friendUserId), 10);
    await friendsService.removeFriend(userId, friendUserId);
    res.status(204).send();
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}
