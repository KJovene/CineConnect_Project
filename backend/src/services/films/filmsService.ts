import {
  createCategory,
  createFilmCategoryLink,
  findCategoryByName,
  findFilmByOmdbId,
  findFilmsByGenreLike,
  findFilmsByIds,
  findFilmsByOmdbIdsWithPoster,
  findReviewAggregatesByFilmIds,
  findTopRatedFilmIds,
  findUnratedFilmIds,
  upsertFilmByOmdb,
} from "../../repository/filmsRepository.js";
import type {
  Film,
  FilmSearchResult,
  SearchResponse,
  GenreSection,
} from "@cineconnect/shared";

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";
const POSTER_CHECK_TIMEOUT_MS = 3500;
const posterReachabilityCache = new Map<string, boolean>();
const OMDB_RAW_ID_KEY = `i${"mdb"}ID`;
const OMDB_RAW_RATING_KEY = `i${"mdb"}Rating`;
const OMDB_RAW_VOTES_KEY = `i${"mdb"}Votes`;

// Types OMDB bruts
interface OmdbSearchItem {
  omdbId: string;
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
  omdbId: string;
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
  omdbRating: string;
  omdbVotes: string;
  Awards: string;
  Rated: string;
  Response: string;
}

function readStringField(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function normalizeOmdbSearchItem(raw: Record<string, unknown>): OmdbSearchItem {
  return {
    omdbId: readStringField(raw, OMDB_RAW_ID_KEY),
    Title: readStringField(raw, "Title"),
    Year: readStringField(raw, "Year"),
    Type: readStringField(raw, "Type"),
    Poster: readStringField(raw, "Poster"),
  };
}

function normalizeOmdbDetail(raw: Record<string, unknown>): OmdbDetail {
  return {
    omdbId: readStringField(raw, OMDB_RAW_ID_KEY),
    Title: readStringField(raw, "Title"),
    Year: readStringField(raw, "Year"),
    Type: readStringField(raw, "Type"),
    Poster: readStringField(raw, "Poster"),
    Genre: readStringField(raw, "Genre"),
    Director: readStringField(raw, "Director"),
    Plot: readStringField(raw, "Plot"),
    Runtime: readStringField(raw, "Runtime"),
    Language: readStringField(raw, "Language"),
    Country: readStringField(raw, "Country"),
    omdbRating: readStringField(raw, OMDB_RAW_RATING_KEY),
    omdbVotes: readStringField(raw, OMDB_RAW_VOTES_KEY),
    Awards: readStringField(raw, "Awards"),
    Rated: readStringField(raw, "Rated"),
    Response: readStringField(raw, "Response"),
  };
}

// Helpers
function cleanPoster(poster: string | undefined): string | null {
  if (!poster || poster === "N/A" || poster.trim() === "") return null;
  return poster.trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function isPosterUrlReachable(url: string): Promise<boolean> {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  const cached = posterReachabilityCache.get(url);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(POSTER_CHECK_TIMEOUT_MS),
    });

    if (headResponse.ok) {
      posterReachabilityCache.set(url, true);
      return true;
    }

    if (headResponse.status === 405 || headResponse.status === 501) {
      const getResponse = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { Range: "bytes=0-0" },
        signal: AbortSignal.timeout(POSTER_CHECK_TIMEOUT_MS),
      });

      const reachable = getResponse.ok;
      posterReachabilityCache.set(url, reachable);
      return reachable;
    }

    posterReachabilityCache.set(url, false);
    return false;
  } catch {
    posterReachabilityCache.set(url, false);
    return false;
  }
}

async function normalizePosterUrl(
  poster: string | undefined,
): Promise<string | null> {
  const cleanedPoster = cleanPoster(poster);
  if (!cleanedPoster) return null;
  if (!isHttpUrl(cleanedPoster)) return null;

  const reachable = await isPosterUrlReachable(cleanedPoster);
  return reachable ? cleanedPoster : null;
}

async function hasUsablePoster(
  posterUrl: string | null | undefined,
): Promise<boolean> {
  if (!posterUrl) return false;
  if (!isHttpUrl(posterUrl)) return false;

  return isPosterUrlReachable(posterUrl);
}

async function filterFilmsWithUsablePoster(items: Film[]): Promise<Film[]> {
  const filtered = await Promise.all(
    items.map(async (item) => {
      const validPoster = await hasUsablePoster(item.poster_url);
      return validPoster ? item : null;
    }),
  );

  return filtered.filter(Boolean) as Film[];
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
  const raw = (await res.json()) as Record<string, unknown>;
  const rawSearch = Array.isArray(raw.Search)
    ? (raw.Search as Record<string, unknown>[])
    : [];

  return {
    Search: rawSearch.map(normalizeOmdbSearchItem),
    totalResults: readStringField(raw, "totalResults"),
    Response: readStringField(raw, "Response"),
    Error: readStringField(raw, "Error") || undefined,
  };
}

async function fetchOmdbDetail(omdbId: string): Promise<OmdbDetail> {
  if (!OMDB_API_KEY) throw new Error("OMDB_API_KEY manquante dans .env");

  const url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${omdbId}&plot=full`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OMDB detail HTTP ${res.status}`);
  const raw = (await res.json()) as Record<string, unknown>;
  return normalizeOmdbDetail(raw);
}

// Lie un film à ses catégories (crée la catégorie si elle n'existe pas encore)
async function linkFilmCategories(
  filmId: number,
  genreString: string,
): Promise<void> {
  const genres = genreString
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  for (const genre of genres) {
    let category = await findCategoryByName(genre);

    if (!category) {
      category = await createCategory(genre);
    }

    await createFilmCategoryLink(filmId, category.category_id);
  }
}

//  Sauvegarde en BDD
async function upsertFilmFromOmdbDetail(
  omdbDetail: OmdbDetail,
): Promise<Film | null> {
  const posterUrl = await normalizePosterUrl(omdbDetail.Poster);
  if (!posterUrl) {
    return null;
  }

  const values = {
    omdb_id: omdbDetail.omdbId,
    title: omdbDetail.Title,
    year: parseYear(omdbDetail.Year),
    type: parseType(omdbDetail.Type),
    director: omdbDetail.Director !== "N/A" ? omdbDetail.Director : null,
    poster_url: posterUrl,
    genre: omdbDetail.Genre !== "N/A" ? omdbDetail.Genre : null,
    plot: omdbDetail.Plot !== "N/A" ? omdbDetail.Plot : null,
    runtime: omdbDetail.Runtime !== "N/A" ? omdbDetail.Runtime : null,
    omdb_rating: omdbDetail.omdbRating !== "N/A" ? omdbDetail.omdbRating : null,
    awards: omdbDetail.Awards !== "N/A" ? omdbDetail.Awards : null,
  };

  const film = await upsertFilmByOmdb(values);

  if (values.genre) {
    await linkFilmCategories(film.film_id, values.genre);
  }

  return film as unknown as Film;
}

export async function withCommunityRatings(items: Film[]): Promise<Film[]> {
  if (items.length === 0) return items;

  const filmIds = items.map((film) => film.film_id);

  const aggregates = await findReviewAggregatesByFilmIds(filmIds);

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
  const omdbIds = omdbSearch.Search.map((item) => item.omdbId);

  // Récupérer les films existants en BDD
  const existingFilms = await findFilmsByOmdbIdsWithPoster(omdbIds);

  const validExistingFilms = await Promise.all(
    (existingFilms as unknown as Film[]).map(async (film) => {
      const validPoster = await hasUsablePoster(film.poster_url);
      return validPoster ? film : null;
    }),
  ).then((items) => items.filter(Boolean) as Film[]);

  const existingIds = new Set(validExistingFilms.map((f) => f.omdb_id));

  const missingIds = omdbIds.filter((id) => !existingIds.has(id));

  const newFilms: Film[] = await Promise.all(
    missingIds.map(async (omdbId) => {
      const detail = await fetchOmdbDetail(omdbId);
      if (detail.Response === "False") return null;
      if (parseType(detail.Type) !== "movie") return null;
      return upsertFilmFromOmdbDetail(detail);
    }),
  ).then((results) => results.filter(Boolean) as Film[]);

  const allFilms = [...validExistingFilms, ...newFilms] as Film[];
  const filmMap = new Map(allFilms.map((f) => [f.omdb_id, f]));

  const resultCandidates = omdbIds.map((id) => {
    const film = filmMap.get(id);
    if (!film) return null;
    return {
      omdb_id: film.omdb_id,
      title: film.title,
      year: film.year,
      type: film.type,
      poster_url: film.poster_url,
    } satisfies FilmSearchResult;
  });

  const results = await Promise.all(
    resultCandidates.map(async (candidate) => {
      if (!candidate) return null;
      const validPoster = await hasUsablePoster(candidate.poster_url);
      return validPoster ? candidate : null;
    }),
  ).then((items) => items.filter(Boolean) as FilmSearchResult[]);

  return { results, totalResults, page };
}

export async function getFilmDetail(omdbId: string): Promise<Film | null> {
  const existing = await findFilmByOmdbId(omdbId);

  if (existing) {
    if (existing.type !== "movie") return null;

    const existingFilm = existing as unknown as Film;
    if (await hasUsablePoster(existingFilm.poster_url)) {
      return existingFilm;
    }
  }

  const detail = await fetchOmdbDetail(omdbId);
  if (detail.Response === "False") return null;
  if (parseType(detail.Type) !== "movie") return null;

  return upsertFilmFromOmdbDetail(detail);
}

export async function getTopRatedFilms(limit = 10): Promise<Film[]> {
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;

  const ratedRows = await findTopRatedFilmIds(safeLimit);

  const ratedIds = ratedRows.map((row) => row.film_id);

  let orderedFilms: Film[] = [];
  if (ratedIds.length > 0) {
    const ratedFilms = await findFilmsByIds(ratedIds);

    const ratedById = new Map(
      (ratedFilms as unknown as Film[]).map((film) => [film.film_id, film]),
    );

    orderedFilms = ratedIds
      .map((filmId) => ratedById.get(filmId))
      .filter(Boolean) as Film[];
  }

  const remaining = safeLimit - orderedFilms.length;
  if (remaining > 0) {
    const unratedRows = await findUnratedFilmIds(remaining);

    const unratedIds = unratedRows.map((row) => row.film_id);

    if (unratedIds.length > 0) {
      const unratedFilms = await findFilmsByIds(unratedIds);

      const unratedById = new Map(
        (unratedFilms as unknown as Film[]).map((film) => [film.film_id, film]),
      );

      const orderedUnrated = unratedIds
        .map((filmId) => unratedById.get(filmId))
        .filter(Boolean) as Film[];

      orderedFilms = [...orderedFilms, ...orderedUnrated];
    }
  }

  const filmsWithRatings = await withCommunityRatings(orderedFilms);
  return filterFilmsWithUsablePoster(filmsWithRatings);
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
    const result = await findFilmsByGenreLike(genre, limitPerGenre);

    const usableFilms = await filterFilmsWithUsablePoster(
      result as unknown as Film[],
    );

    if (usableFilms.length > 0) {
      const filmsWithRatings = await withCommunityRatings(usableFilms);
      sections.push({
        genre,
        films: filmsWithRatings,
      });
    }
  }

  return sections;
}
