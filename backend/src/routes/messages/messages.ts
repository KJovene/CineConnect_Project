import { Router } from "express";
import { attachSession, requireAuth } from "../../middlewares/authMiddleware.js";
import {
  createMessage,
  getConversation,
  getIncomingMessages,
  getRecentConversations,
} from "../../controllers/messages-controller.js";

const router = Router();

router.use(attachSession, requireAuth);
router.get("/with/:userId", getConversation);
router.get("/conversations", getRecentConversations);
router.get("/incoming", getIncomingMessages);
router.post("/", createMessage);

export default router;
