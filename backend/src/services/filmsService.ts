import { db } from "../db/index.js";
import { films, reviews } from "../db/schema.js";
import {
  and,
  eq,
  desc,
  isNotNull,
  isNull,
  sql,
  inArray,
  like,
} from "drizzle-orm";
import type {
  Film,
  FilmSearchResult,
  SearchResponse,
  GenreSection,
} from "@cineconnect/shared";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// Types OMDB bruts
interface OmdbSearchItem {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

interface OmdbSearchResponse {
  Search: OmdbSearchItem[];
  totalResults: string;
  Response: string;
  Error?: string;
}

interface OmdbDetail {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  Genre: string;
  Director: string;
  Plot: string;
  Runtime: string;
  Language: string;
  Country: string;
  imdbRating: string;
  imdbVotes: string;
  Awards: string;
  Rated: string;
  Response: string;
}

// Helpers
function cleanPoster(poster: string | undefined): string | null {
  if (!poster || poster === "N/A" || poster.trim() === "") return null;
  return poster;
}

function parseYear(year: string | undefined): number | null {
  if (!year || year === "N/A") return null;

  const parsed = parseInt(year.slice(0, 4), 10);
  return isNaN(parsed) ? null : parsed;
}

function parseType(type: string | undefined): "movie" | null {
  if (type === "movie") return type;
  return null;
}

//  Appels OMDB
async function fetchOmdbSearch(
  query: string,
  page: number,
): Promise<OmdbSearchResponse> {
  if (!OMDB_API_KEY) throw new Error("OMDB_API_KEY manquante dans .env");

  const url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDB search HTTP ${res.status}`);
  return await res.json();
}

async function fetchOmdbDetail(imdbId: string): Promise<OmdbDetail> {
  if (!OMDB_API_KEY) throw new Error("OMDB_API_KEY manquante dans .env");

  const url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDB detail HTTP ${res.status}`);
  return await res.json();
}

//  Sauvegarde en BDD
async function upsertFilmFromOmdbDetail(omdbDetail: OmdbDetail): Promise<Film> {
  const values = {
    omdb_id: omdbDetail.imdbID,
    title: omdbDetail.Title,
    year: parseYear(omdbDetail.Year),
    type: parseType(omdbDetail.Type),
    director: omdbDetail.Director !== "N/A" ? omdbDetail.Director : null,
    poster_url: cleanPoster(omdbDetail.Poster),
    genre: omdbDetail.Genre !== "N/A" ? omdbDetail.Genre : null,
    plot: omdbDetail.Plot !== "N/A" ? omdbDetail.Plot : null,
    runtime: omdbDetail.Runtime !== "N/A" ? omdbDetail.Runtime : null,
    imdb_rating: omdbDetail.imdbRating !== "N/A" ? omdbDetail.imdbRating : null,
    awards: omdbDetail.Awards !== "N/A" ? omdbDetail.Awards : null,
  };

  const [film] = await db
    .insert(films)
    .values(values)
    .onConflictDoUpdate({
      target: films.omdb_id,
      set: { ...values, updated_at: new Date() },
    })
    .returning();

  return film as unknown as Film;
}

async function withCommunityRatings(items: Film[]): Promise<Film[]> {
  if (items.length === 0) return items;

  const filmIds = items.map((film) => film.film_id);

  const aggregates = await db
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

  const aggregateMap = new Map(aggregates.map((item) => [item.film_id, item]));

  return items.map((film) => {
    const aggregate = aggregateMap.get(film.film_id);
    if (!aggregate) {
      return {
        ...film,
        average_rating: null,
        ratings_count: 0,
      };
    }

    return {
      ...film,
      average_rating:
        aggregate.average_rating === null
          ? null
          : Number(aggregate.average_rating),
      ratings_count: Number(aggregate.ratings_count),
    };
  });
}

//  Service public
export async function searchFilms(
  query: string,
  page = 1,
): Promise<SearchResponse> {
  const omdbSearch = await fetchOmdbSearch(query, page);

  if (omdbSearch.Response === "False" || !omdbSearch.Search) {
    return { results: [], totalResults: 0, page };
  }

  const totalResults = parseInt(omdbSearch.totalResults, 10) || 0;
  const omdbIds = omdbSearch.Search.map((item) => item.imdbID);

  // Récupérer les films existants en BDD
  const existingFilms = await db
    .select()
    .from(films)
    .where(inArray(films.omdb_id, omdbIds));

  const existingIds = new Set(existingFilms.map((f) => f.omdb_id));

  const missingIds = omdbIds.filter((id) => !existingIds.has(id));

  const newFilms: Film[] = await Promise.all(
    missingIds.map(async (imdbId) => {
      const detail = await fetchOmdbDetail(imdbId);
      if (detail.Response === "False") return null;
      if (parseType(detail.Type) !== "movie") return null;
      return upsertFilmFromOmdbDetail(detail);
    }),
  ).then((results) => results.filter(Boolean) as Film[]);

  const allFilms = [...existingFilms, ...newFilms] as unknown as Film[];
  const filmMap = new Map(allFilms.map((f) => [f.omdb_id, f]));

  const results: FilmSearchResult[] = omdbIds
    .map((id) => {
      const film = filmMap.get(id);
      if (!film) return null;
      return {
        omdb_id: film.omdb_id,
        title: film.title,
        year: film.year,
        type: film.type,
        poster_url: film.poster_url,
      } satisfies FilmSearchResult;
    })
    .filter(Boolean) as FilmSearchResult[];

  return { results, totalResults, page };
}

export async function getFilmDetail(omdbId: string): Promise<Film | null> {
  const [existing] = await db
    .select()
    .from(films)
    .where(eq(films.omdb_id, omdbId))
    .limit(1);

  if (existing) {
    return existing.type === "movie" ? (existing as unknown as Film) : null;
  }

  const detail = await fetchOmdbDetail(omdbId);
  if (detail.Response === "False") return null;
  if (parseType(detail.Type) !== "movie") return null;

  return upsertFilmFromOmdbDetail(detail);
}

export async function getTopRatedFilms(limit = 10): Promise<Film[]> {
  const result = await db
    .select()
    .from(films)
    .where(and(isNotNull(films.imdb_rating), eq(films.type, "movie")))
    .orderBy(desc(films.imdb_rating))
    .limit(limit);

  return withCommunityRatings(result as unknown as Film[]);
}

/**
 * Liste des genres à afficher sur la page Films.
 * Chaque genre est recherché via un LIKE sur le champ `genre` (valeurs OMDB, ex: "Action, Crime, Drama").
 */
const GENRE_LIST = [
  "Action",
  "Drama",
  "Comedy",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Crime",
  "Adventure",
  "Horror",
  "Fantasy",
  "Mystery",
  "Romance",
] as const;

/**
 * Récupère les films groupés par genre.
 * @param limitPerGenre Nombre max de films par genre (défaut 24 pour permettre le carousel)
 */
export async function getFilmsByGenre(
  limitPerGenre = 24,
): Promise<GenreSection[]> {
  const sections: GenreSection[] = [];

  for (const genre of GENRE_LIST) {
    const result = await db
      .select()
      .from(films)
      .where(and(eq(films.type, "movie"), like(films.genre, `%${genre}%`)))
      .orderBy(desc(films.imdb_rating))
      .limit(limitPerGenre);

    if (result.length > 0) {
      const filmsWithRatings = await withCommunityRatings(
        result as unknown as Film[],
      );
      sections.push({
        genre,
        films: filmsWithRatings,
      });
    }
  }

  return sections;
}
