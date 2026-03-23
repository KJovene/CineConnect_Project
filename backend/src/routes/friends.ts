import { Router } from "express";
import {
  attachSession,
  requireAuth,
} from "../middlewares/authMiddleware.js";
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controllers/friendsController.js";

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/friends — liste des amis acceptés
router.get("/", getFriends);

// GET /api/friends/pending — demandes reçues en attente
router.get("/pending", getPendingRequests);

// POST /api/friends/request — envoyer une demande
router.post("/request", sendFriendRequest);

// POST /api/friends/accept — accepter une demande
router.post("/accept", acceptFriendRequest);

// POST /api/friends/reject — rejeter une demande
router.post("/reject", rejectFriendRequest);

// DELETE /api/friends/:friendUserId — supprimer un ami
router.delete("/:friendUserId", removeFriend);

export default router;
