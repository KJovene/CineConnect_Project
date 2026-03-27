import { Router } from "express";
import { attachSession, requireAuth } from "../../middlewares/authMiddleware.js";
import {
  getCommentReplies,
  getLatestComments,
  getLatestRatings,
  searchUsers,
} from "../../controllers/users-controller.js";

const router = Router();

router.use(attachSession, requireAuth);
router.get("/me/latest-ratings", getLatestRatings);
router.get("/me/latest-comments", getLatestComments);
router.get("/me/comment-replies", getCommentReplies);
router.get("/", searchUsers);

export default router;
