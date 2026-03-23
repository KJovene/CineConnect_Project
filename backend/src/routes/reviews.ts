import { Router } from "express";
import { attachSession, requireAuth } from "../middlewares/authMiddleware.js";
import {
  createComment,
  createReply,
  getComments,
  getRatingSummary,
  patchComment,
  removeComment,
  setRating,
} from "../controllers/reviews-controller.js";

const router = Router({ mergeParams: true });
router.get("/", getComments);

router.get("/rating-summary", attachSession, getRatingSummary);

router.post("/rating", attachSession, requireAuth, setRating);

router.post("/", attachSession, requireAuth, createComment);

router.post("/:reviewId/replies", attachSession, requireAuth, createReply);

router.patch("/:reviewId", attachSession, requireAuth, patchComment);

router.delete("/:reviewId", attachSession, requireAuth, removeComment);

export default router;
