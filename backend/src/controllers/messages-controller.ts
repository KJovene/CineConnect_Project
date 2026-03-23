import type { Response } from "express";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import * as messagesService from "../services/messagesService.js";

export async function getConversation(req: RequestWithSession, res: Response) {
  try {
    const myId = parseInt(req.session!.user.id, 10);
    const otherId = parseInt(String(req.params.userId), 10);
    const page = parseInt((req.query.page as string) ?? "1", 10);
    const limit = parseInt((req.query.limit as string) ?? "50", 10);

    const data = await messagesService.getConversation(
      myId,
      otherId,
      page,
      limit,
    );
    res.json(data);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getRecentConversations(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const myId = parseInt(req.session!.user.id, 10);
    const data = await messagesService.getRecentConversations(myId);
    res.json(data);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function getIncomingMessages(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const myId = parseInt(req.session!.user.id, 10);
    const limit = parseInt((req.query.limit as string) ?? "20", 10);
    const data = await messagesService.getIncomingMessages(myId, limit);
    res.json(data);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}

export async function createMessage(req: RequestWithSession, res: Response) {
  try {
    const senderId = parseInt(req.session!.user.id, 10);
    const { receiverId, content } = req.body as {
      receiverId: number;
      content: string;
    };

    if (!receiverId || !content?.trim()) {
      res.status(400).json({ error: "receiverId et content requis" });
      return;
    }

    const message = await messagesService.createMessage(
      senderId,
      receiverId,
      content.trim(),
    );
    res.status(201).json(message);
  } catch (_err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
}
