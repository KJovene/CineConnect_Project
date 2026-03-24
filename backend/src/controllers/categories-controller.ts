import type { Request, Response } from "express";
import {
  getAllCategories,
  getFilmsByCategory,
  getFilmsByAllCategories,
} from "../services/categoriesService.js";

export async function listCategories(_req: Request, res: Response) {
  try {
    const data = await getAllCategories();
    res.json(data);
  } catch (err) {
    console.error("[categories/list]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des catégories",
    });
  }
}

export async function getFilms(req: Request, res: Response) {
  const categoryId = parseInt(req.params.id, 10);
  const limit = parseInt(req.query.limit as string, 10) || 24;

  if (isNaN(categoryId)) {
    res.status(400).json({
      error: "Bad Request",
      message: "L'identifiant de catégorie doit être un nombre entier",
    });
    return;
  }

  try {
    const data = await getFilmsByCategory(categoryId, limit);
    res.json(data);
  } catch (err) {
    console.error("[categories/:id/films]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des films de la catégorie",
    });
  }
}

export async function getAllFilms(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string, 10) || 24;

  try {
    const data = await getFilmsByAllCategories(limit);
    res.json(data);
  } catch (err) {
    console.error("[categories/films]", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Erreur lors de la récupération des films par catégorie",
    });
  }
}
