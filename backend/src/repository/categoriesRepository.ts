import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, films, filmsCategories } from "../db/schema.js";

export async function findAllCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function findFilmsByCategoryId(categoryId: number, limit: number) {
  return db
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
      omdb_rating: films.omdb_rating,
      awards: films.awards,
      created_at: films.created_at,
      updated_at: films.updated_at,
    })
    .from(films)
    .innerJoin(filmsCategories, eq(filmsCategories.film_id, films.film_id))
    .where(eq(filmsCategories.category_id, categoryId))
    .orderBy(desc(films.omdb_rating))
    .limit(limit);
}
