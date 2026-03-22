const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

jest.mock('../db/index.js', () => ({ db: mockDb }));

import {
  searchFilms,
  getFilmDetail,
  getTopRatedFilms,
  getFilmsByGenre,
} from '../services/filmsService.js';

describe('filmsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it('searchFilms retourne vide quand OMDB repond False', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: 'False' }),
    });

    const result = await searchFilms('abc', 1);

    expect(result).toEqual({ results: [], totalResults: 0, page: 1 });
  });

  it('searchFilms recupere existants + manquants', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: 'True',
          totalResults: '2',
          Search: [
            { imdbID: 'tt1', Title: 'A', Year: '2000', Type: 'movie', Poster: 'P' },
            { imdbID: 'tt2', Title: 'B', Year: '2001', Type: 'movie', Poster: 'P' },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: 'True',
          imdbID: 'tt2',
          Title: 'B',
          Year: '2001',
          Type: 'movie',
          Poster: 'N/A',
          Genre: 'Action',
          Director: 'N/A',
          Plot: 'N/A',
          Runtime: 'N/A',
          Language: 'N/A',
          Country: 'N/A',
          imdbRating: 'N/A',
          imdbVotes: '0',
          Awards: 'N/A',
          Rated: 'N/A',
        }),
      });

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ film_id: 1, omdb_id: 'tt1', title: 'A', year: 2000, type: 'movie', poster_url: 'x' }]),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { film_id: 2, omdb_id: 'tt2', title: 'B', year: 2001, type: 'movie', poster_url: null },
          ]),
        }),
      }),
    });

    const result = await searchFilms('abc', 2);

    expect(result.totalResults).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.page).toBe(2);
  });

  it('searchFilms throw si HTTP search non OK', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    await expect(searchFilms('abc', 1)).rejects.toThrow('OMDB search HTTP 500');
  });

  it('getFilmDetail retourne film existant movie', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ film_id: 1, omdb_id: 'tt1', type: 'movie' }]),
        }),
      }),
    });

    const result = await getFilmDetail('tt1');

    expect(result?.omdb_id).toBe('tt1');
  });

  it('getFilmDetail retourne null si existant non movie', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ film_id: 1, omdb_id: 'tt1', type: 'series' }]),
        }),
      }),
    });

    const result = await getFilmDetail('tt1');

    expect(result).toBeNull();
  });

  it('getFilmDetail appelle OMDB si absent puis retourne null si False', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: 'False' }),
    });

    const result = await getFilmDetail('tt2');

    expect(result).toBeNull();
  });

  it('getFilmDetail throw si HTTP detail non OK', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    await expect(getFilmDetail('tt2')).rejects.toThrow('OMDB detail HTTP 404');
  });

  it('getTopRatedFilms retourne films enrichis ratings', async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                { film_id: 1, omdb_id: 'tt1', imdb_rating: '8.1', type: 'movie' },
              ]),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([
              { film_id: 1, average_rating: '4.50', ratings_count: 2 },
            ]),
          }),
        }),
      });

    const result = await getTopRatedFilms(5);

    expect(result[0].average_rating).toBe(4.5);
    expect(result[0].ratings_count).toBe(2);
  });

  it('getFilmsByGenre ignore genres vides et garde ceux avec films', async () => {
    const firstFilm = [
      { film_id: 1, omdb_id: 'tt1', imdb_rating: '8.0', type: 'movie', title: 'A' },
    ];
    const queue: unknown[] = [
      firstFilm,
      [{ film_id: 1, average_rating: null, ratings_count: 0 }],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
    ];

    mockDb.select.mockImplementation(() => ({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(async () => queue.shift()),
          }),
          groupBy: jest.fn().mockImplementation(async () => queue.shift()),
        }),
      }),
    }));

    const result = await getFilmsByGenre(2);

    expect(result).toHaveLength(1);
    expect(result[0].films).toHaveLength(1);
  });
});
