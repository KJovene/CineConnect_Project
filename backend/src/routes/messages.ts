import { Router } from "express";
import {
  attachSession,
  requireAuth,
} from "../middlewares/authMiddleware.js";
import {
  createMessage,
  getConversation,
  getIncomingMessages,
  getRecentConversations,
} from "../controllers/messagesController.js";

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/messages/with/:userId — historique d'une conversation
router.get("/with/:userId", getConversation);

// GET /api/messages/conversations — liste des dernières conversations
router.get("/conversations", getRecentConversations);

// GET /api/messages/incoming?limit=20 — messages reçus pour les notifications
router.get("/incoming", getIncomingMessages);

// POST /api/messages — envoyer un message (fallback sans socket)
router.post("/", createMessage);

export default router;
