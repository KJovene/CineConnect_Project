import { Router } from "express";
import {
  listCategories,
  getFilms,
  getAllFilms,
} from "../controllers/categories-controller.js";

const router = Router();

// ─── GET /api/categories ───────────────────────────────────────────────────────
// Liste toutes les catégories disponibles.

router.get("/", listCategories);

// ─── GET /api/categories/films?limit=24 ───────────────────────────────────────
// Films groupés par catégorie → remplace /api/films/by-genre.
//  Cette route doit être AVANT /:id/films pour ne pas être interceptée.

router.get("/films", getAllFilms);

// ─── GET /api/categories/:id/films?limit=24 ───────────────────────────────────
// Films d'une catégorie spécifique.

router.get("/:id/films", getFilms);

export default router;
