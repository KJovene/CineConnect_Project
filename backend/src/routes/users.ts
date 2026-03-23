import { Router } from "express";
import {
  attachSession,
  requireAuth,
} from "../middlewares/authMiddleware.js";
import {
  getCommentReplies,
  getLatestComments,
  getLatestRatings,
  searchUsers,
} from "../controllers/usersController.js";

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/users/me/latest-ratings — dernières notes de l'utilisateur connecté
router.get("/me/latest-ratings", getLatestRatings);

// GET /api/users/me/latest-comments — derniers commentaires de l'utilisateur connecté
router.get("/me/latest-comments", getLatestComments);

// GET /api/users/me/comment-replies — réponses reçues sur les commentaires de l'utilisateur
router.get("/me/comment-replies", getCommentReplies);

// GET /api/users?search= — rechercher des utilisateurs avec statut de relation
router.get("/", searchUsers);

export default router;
