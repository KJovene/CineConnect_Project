import { Router } from "express";
import { attachSession, requireAuth } from "../middlewares/authMiddleware.js";
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controllers/friends-controller.js";

const router = Router();

router.use(attachSession, requireAuth);
router.get("/", getFriends);
router.get("/pending", getPendingRequests);
router.post("/request", sendFriendRequest);
router.post("/accept", acceptFriendRequest);
router.post("/reject", rejectFriendRequest);
router.delete("/:friendUserId", removeFriend);

export default router;
