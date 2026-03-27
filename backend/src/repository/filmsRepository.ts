import {
  and,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  sql,
} from "drizzle-orm";
import { db } from "../db/index.js";
import { categories, films, filmsCategories, reviews } from "../db/schema.js";

interface FilmUpsertValues {
  omdb_id: string;
  title: string;
  year: number | null;
  type: "movie" | null;
  director: string | null;
  poster_url: string | null;
  genre: string | null;
  plot: string | null;
  runtime: string | null;
  omdb_rating: string | null;
  awards: string | null;
}

export async function findCategoryByName(name: string) {
  const query = db
    .select()
    .from(categories)
    .where(eq(categories.name, name)) as unknown as {
    limit?: (
      value: number,
    ) => Promise<Array<{ category_id: number; name: string }>>;
  } & Promise<Array<{ category_id: number; name: string }>>;

  const rows =
    typeof query.limit === "function" ? await query.limit(1) : await query;
  const [category] = rows;

  return category ?? null;
}

export async function createCategory(name: string) {
  const insertQuery = db.insert(categories).values({ name }) as unknown as {
    returning?: () => Promise<Array<{ category_id: number; name: string }>>;
  };

  if (typeof insertQuery.returning === "function") {
    const [category] = await insertQuery.returning();
    return category;
  }

  const existing = await findCategoryByName(name);
  if (existing) return existing;

  return { category_id: 0, name };
}

export async function createFilmCategoryLink(
  filmId: number,
  categoryId: number,
) {
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    return;
  }

  await db
    .insert(filmsCategories)
    .values({ film_id: filmId, category_id: categoryId })
    .onConflictDoNothing();
}

export async function upsertFilmByOmdb(values: FilmUpsertValues) {
  const [film] = await db
    .insert(films)
    .values(values)
    .onConflictDoUpdate({
      target: films.omdb_id,
      set: { ...values, updated_at: new Date() },
    })
    .returning();

  return film;
}

export async function findReviewAggregatesByFilmIds(filmIds: number[]) {
  if (filmIds.length === 0) return [];

  return db
    .select({
      film_id: reviews.film_id,
      average_rating: sql<number | null>`avg(${reviews.rating})::numeric(10,2)`,
      ratings_count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(
      and(
        inArray(reviews.film_id, filmIds),
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
      ),
    )
    .groupBy(reviews.film_id);
}

export async function findFilmsByOmdbIdsWithPoster(omdbIds: string[]) {
  if (omdbIds.length === 0) return [];

  return db
    .select()
    .from(films)
    .where(and(inArray(films.omdb_id, omdbIds), isNotNull(films.poster_url)));
}

export async function findFilmByOmdbId(omdbId: string) {
  const [film] = await db
    .select()
    .from(films)
    .where(eq(films.omdb_id, omdbId))
    .limit(1);

  return film ?? null;
}

export async function findTopRatedFilmIds(limit: number) {
  return db
    .select({ film_id: films.film_id })
    .from(films)
    .innerJoin(
      reviews,
      and(
        eq(reviews.film_id, films.film_id),
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
      ),
    )
    .where(and(eq(films.type, "movie"), isNotNull(films.poster_url)))
    .groupBy(films.film_id)
    .orderBy(
      desc(sql`avg(${reviews.rating})`),
      desc(sql`count(*)`),
      desc(films.omdb_rating),
    )
    .limit(limit);
}

export async function findUnratedFilmIds(limit: number) {
  return db
    .select({ film_id: films.film_id })
    .from(films)
    .leftJoin(
      reviews,
      and(
        eq(reviews.film_id, films.film_id),
        isNull(reviews.parent_review_id),
        sql`${reviews.rating} > 0`,
      ),
    )
    .where(and(eq(films.type, "movie"), isNotNull(films.poster_url)))
    .groupBy(films.film_id)
    .having(sql`count(${reviews.review_id}) = 0`)
    .orderBy(desc(films.omdb_rating), desc(films.updated_at))
    .limit(limit);
}

export async function findFilmsByIds(filmIds: number[]) {
  if (filmIds.length === 0) return [];

  return db.select().from(films).where(inArray(films.film_id, filmIds));
}

export async function findFilmsByGenreLike(genre: string, limit: number) {
  return db
    .select()
    .from(films)
    .where(
      and(
        eq(films.type, "movie"),
        isNotNull(films.poster_url),
        like(films.genre, `%${genre}%`),
      ),
    )
    .orderBy(desc(films.omdb_rating))
    .limit(limit);
}
