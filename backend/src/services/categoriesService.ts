import {
  findAllCategories,
  findFilmsByCategoryId,
} from "../repositories/categoriesRepository.js";
import type {
  Film,
  Category,
  CategorySection,
  FilmsByCategoryResponse,
} from "@cineconnect/shared";
import { withCommunityRatings } from "./filmsService.js";

/**
 * Retourne toutes les catégories disponibles.
 */
export async function getAllCategories(): Promise<Category[]> {
  const result = await findAllCategories();

  return result as Category[];
}

/**
 * Retourne les films d'une catégorie donnée, triés par note IMDB.
 * @param categoryId  ID de la catégorie
 * @param limit       Nombre max de films (défaut 24)
 */
export async function getFilmsByCategory(
  categoryId: number,
  limit = 24,
): Promise<Film[]> {
  const result = await findFilmsByCategoryId(categoryId, limit);

  return withCommunityRatings(result as unknown as Film[]);
}

/**
 * Retourne les films groupés par catégorie.
 * Remplace getFilmsByGenre() en passant par les vraies tables.
 * @param limitPerCategory  Nombre max de films par catégorie (défaut 24)
 */
export async function getFilmsByAllCategories(
  limitPerCategory = 24,
): Promise<FilmsByCategoryResponse> {
  const allCategories = await findAllCategories();

  const sections: CategorySection[] = [];

  for (const category of allCategories) {
    const categoryFilms = await getFilmsByCategory(
      category.category_id,
      limitPerCategory,
    );

    if (categoryFilms.length > 0) {
      sections.push({
        category: category as Category,
        films: categoryFilms,
      });
    }
  }

  return sections;
}
