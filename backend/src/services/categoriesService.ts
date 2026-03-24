import { db } from "../db/index.js";
import { films, categories, filmsCategories } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
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
  const result = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

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
  const result = await db
    .select({
      film_id: films.film_id,
      omdb_id: films.omdb_id,
      title: films.title,
      year: films.year,
      type: films.type,
      director: films.director,
      poster_url: films.poster_url,
      genre: films.genre,
      plot: films.plot,
      runtime: films.runtime,
      imdb_rating: films.imdb_rating,
      awards: films.awards,
      created_at: films.created_at,
      updated_at: films.updated_at,
    })
    .from(films)
    .innerJoin(filmsCategories, eq(filmsCategories.film_id, films.film_id))
    .where(eq(filmsCategories.category_id, categoryId))
    .orderBy(desc(films.imdb_rating))
    .limit(limit);

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
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

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
