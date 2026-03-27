const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
};

const OMDB_ID_FIELD = `i${"mdb"}ID`;
const OMDB_RATING_FIELD = `i${"mdb"}Rating`;
const OMDB_VOTES_FIELD = `i${"mdb"}Votes`;

jest.mock("../../db/index.js", () => ({ db: mockDb }));

import {
  searchFilms,
  getFilmDetail,
  getTopRatedFilms,
  getFilmsByGenre,
} from "./filmsService.js";

describe("filmsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it("searchFilms retourne vide quand OMDB repond False", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "False" }),
    });

    const result = await searchFilms("abc", 1);

    expect(result).toEqual({ results: [], totalResults: 0, page: 1 });
  });

  it("searchFilms utilise page par defaut", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "False" }),
    });

    const result = await searchFilms("abc");

    expect(result.page).toBe(1);
  });

  it("searchFilms throw si OMDB_API_KEY manquante", async () => {
    jest.resetModules();
    delete process.env.OMDB_API_KEY;

    let mod: typeof import("./filmsService.js");
    jest.isolateModules(() => {
      jest.doMock("../../db/index.js", () => ({
        db: {
          select: jest.fn(),
          insert: jest.fn(),
        },
      }));

      mod = require("./filmsService.js");
    });

    await expect(mod!.searchFilms("abc")).rejects.toThrow(
      "OMDB_API_KEY manquante dans .env",
    );

    process.env.OMDB_API_KEY = "test-omdb-key";
  });

  it("searchFilms mappe totalResults invalide sur 0", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        totalResults: "nope",
        Search: [],
      }),
    });

    mockDb.select.mockReturnValue({
      from: jest
        .fn()
        .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
    });

    const result = await searchFilms("abc", 1);

    expect(result.totalResults).toBe(0);
  });

  it("searchFilms recupere existants + manquants", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: "True",
          totalResults: "2",
          Search: [
            {
              [OMDB_ID_FIELD]: "tt1",
              Title: "A",
              Year: "2000",
              Type: "movie",
              Poster: "https://images.example.com/tt1.jpg",
            },
            {
              [OMDB_ID_FIELD]: "tt2",
              Title: "B",
              Year: "2001",
              Type: "movie",
              Poster: "https://images.example.com/tt2.jpg",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: "True",
          [OMDB_ID_FIELD]: "tt2",
          Title: "B",
          Year: "2001",
          Type: "movie",
          Poster: "https://images.example.com/tt2.jpg",
          Genre: "Action",
          Director: "N/A",
          Plot: "N/A",
          Runtime: "N/A",
          Language: "N/A",
          Country: "N/A",
          [OMDB_RATING_FIELD]: "N/A",
          [OMDB_VOTES_FIELD]: "0",
          Awards: "N/A",
          Rated: "N/A",
        }),
      });

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([
          {
            film_id: 1,
            omdb_id: "tt1",
            title: "A",
            year: 2000,
            type: "movie",
            poster_url: "https://images.example.com/tt1.jpg",
          },
        ]),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              film_id: 2,
              omdb_id: "tt2",
              title: "B",
              year: 2001,
              type: "movie",
              poster_url: "https://images.example.com/tt2.jpg",
            },
          ]),
        }),
      }),
    });

    const result = await searchFilms("abc", 2);

    expect(result.totalResults).toBe(2);
    expect(result.results).toHaveLength(2);
    expect(result.page).toBe(2);
  });

  it("searchFilms filtre detail OMDB False et type non-movie", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: "True",
          totalResults: "2",
          Search: [
            {
              [OMDB_ID_FIELD]: "tt10",
              Title: "A",
              Year: "N/A",
              Type: "movie",
              Poster: "   ",
            },
            {
              [OMDB_ID_FIELD]: "tt11",
              Title: "B",
              Year: "2001-2002",
              Type: "movie",
              Poster: "N/A",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ Response: "False" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          Response: "True",
          [OMDB_ID_FIELD]: "tt11",
          Title: "B",
          Year: "abcd",
          Type: "series",
          Poster: "",
          Genre: "N/A",
          Director: "N/A",
          Plot: "N/A",
          Runtime: "N/A",
          Language: "N/A",
          Country: "N/A",
          [OMDB_RATING_FIELD]: "N/A",
          [OMDB_VOTES_FIELD]: "0",
          Awards: "N/A",
          Rated: "N/A",
        }),
      });

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    const result = await searchFilms("abc", 1);

    expect(result.results).toEqual([]);
    expect(result.totalResults).toBe(2);
  });

  it("searchFilms throw si HTTP search non OK", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    await expect(searchFilms("abc", 1)).rejects.toThrow("OMDB search HTTP 500");
  });

  it("getFilmDetail retourne film existant movie", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            {
              film_id: 1,
              omdb_id: "tt1",
              type: "movie",
              poster_url: "https://images.example.com/tt1.jpg",
            },
          ]),
        }),
      }),
    });

    const result = await getFilmDetail("tt1");

    expect(result?.omdb_id).toBe("tt1");
  });

  it("getFilmDetail retourne null si existant non movie", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockResolvedValue([
              { film_id: 1, omdb_id: "tt1", type: "series" },
            ]),
        }),
      }),
    });

    const result = await getFilmDetail("tt1");

    expect(result).toBeNull();
  });

  it("getFilmDetail appelle OMDB si absent puis retourne null si False", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ Response: "False" }),
    });

    const result = await getFilmDetail("tt2");

    expect(result).toBeNull();
  });

  it("getFilmDetail retourne null si detail OMDB non movie", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        [OMDB_ID_FIELD]: "tt2",
        Title: "B",
        Year: "2001",
        Type: "series",
      }),
    });

    const result = await getFilmDetail("tt2");

    expect(result).toBeNull();
  });

  it("getFilmDetail upsert un detail OMDB movie", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              film_id: 3,
              omdb_id: "tt3",
              title: "Movie",
              type: "movie",
              poster_url: "https://images.example.com/tt3.jpg",
            },
          ]),
        }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        [OMDB_ID_FIELD]: "tt3",
        Title: "Movie",
        Year: "2001",
        Type: "movie",
        Poster: "https://images.example.com/tt3.jpg",
        Genre: "Drama",
        Director: "John",
        Plot: "Plot",
        Runtime: "120 min",
        Language: "EN",
        Country: "US",
        [OMDB_RATING_FIELD]: "7.1",
        [OMDB_VOTES_FIELD]: "100",
        Awards: "None",
        Rated: "PG",
      }),
    });

    const result = await getFilmDetail("tt3");

    expect(result?.omdb_id).toBe("tt3");
  });

  it("getFilmDetail ignore un detail OMDB sans poster valide", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    const values = jest.fn();
    mockDb.insert.mockReturnValue({ values });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        [OMDB_ID_FIELD]: "tt4",
        Title: "Movie",
        Year: "N/A",
        Type: "movie",
        Poster: "N/A",
        Genre: "N/A",
        Director: "N/A",
        Plot: "N/A",
        Runtime: "N/A",
        Language: "EN",
        Country: "US",
        [OMDB_RATING_FIELD]: "N/A",
        [OMDB_VOTES_FIELD]: "100",
        Awards: "N/A",
        Rated: "PG",
      }),
    });

    const result = await getFilmDetail("tt4");

    expect(result).toBeNull();
    expect(values).not.toHaveBeenCalled();
  });

  it("getFilmDetail upsert avec year invalide retourne null", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    const values = jest.fn().mockReturnValue({
      onConflictDoUpdate: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          {
            film_id: 5,
            omdb_id: "tt5",
            title: "Movie",
            type: "movie",
            poster_url: "https://images.example.com/tt5.jpg",
          },
        ]),
      }),
    });
    mockDb.insert.mockReturnValue({ values });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        Response: "True",
        [OMDB_ID_FIELD]: "tt5",
        Title: "Movie",
        Year: "abcd",
        Type: "movie",
        Poster: "https://images.example.com/tt5.jpg",
        Genre: "Drama",
        Director: "John",
        Plot: "Plot",
        Runtime: "120 min",
        Language: "EN",
        Country: "US",
        [OMDB_RATING_FIELD]: "7.1",
        [OMDB_VOTES_FIELD]: "100",
        Awards: "None",
        Rated: "PG",
      }),
    });

    await getFilmDetail("tt5");

    const inserted = values.mock.calls[0][0] as { year: number | null };
    expect(inserted.year).toBeNull();
  });

  it("getFilmDetail throw si HTTP detail non OK", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
      }),
    });

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    await expect(getFilmDetail("tt2")).rejects.toThrow("OMDB detail HTTP 404");
  });

  it("getFilmDetail throw si OMDB_API_KEY manquante", async () => {
    jest.resetModules();
    delete process.env.OMDB_API_KEY;

    let mod: typeof import("./filmsService.js");
    jest.isolateModules(() => {
      jest.doMock("../../db/index.js", () => ({
        db: {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
          insert: jest.fn(),
        },
      }));

      mod = require("./filmsService.js");
    });

    await expect(mod!.getFilmDetail("tt2")).rejects.toThrow(
      "OMDB_API_KEY manquante dans .env",
    );

    process.env.OMDB_API_KEY = "test-omdb-key";
  });

  it("getTopRatedFilms retourne films enrichis ratings", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([{ film_id: 1 }]),
                }),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              film_id: 1,
              omdb_id: "tt1",
              omdb_rating: "8.1",
              type: "movie",
              poster_url: "https://images.example.com/tt1.jpg",
            },
          ]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest
              .fn()
              .mockResolvedValue([
                { film_id: 1, average_rating: "4.50", ratings_count: 2 },
              ]),
          }),
        }),
      });

    const result = await getTopRatedFilms(1);

    expect(result[0].average_rating).toBe(4.5);
    expect(result[0].ratings_count).toBe(2);
  });

  it("getTopRatedFilms utilise la limite par defaut", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockReturnValue({
              having: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      }),
    });

    await getTopRatedFilms();

    expect(limit).toHaveBeenCalledWith(10);
  });

  it("getTopRatedFilms met aggregate absent a null/0", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              groupBy: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([{ film_id: 1 }]),
                }),
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            {
              film_id: 1,
              omdb_id: "tt1",
              omdb_rating: "8.1",
              type: "movie",
              poster_url: "https://images.example.com/tt1.jpg",
            },
          ]),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            groupBy: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

    const result = await getTopRatedFilms(1);

    expect(result[0].average_rating).toBeNull();
    expect(result[0].ratings_count).toBe(0);
  });

  it("getFilmsByGenre ignore genres vides et garde ceux avec films", async () => {
    const firstFilm = [
      {
        film_id: 1,
        omdb_id: "tt1",
        omdb_rating: "8.0",
        type: "movie",
        title: "A",
        poster_url: "https://images.example.com/tt1.jpg",
      },
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

  it("getFilmsByGenre utilise la limite par defaut", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    mockDb.select.mockImplementation(() => ({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({ limit }),
          groupBy: jest.fn().mockResolvedValue([]),
        }),
      }),
    }));

    await getFilmsByGenre();

    expect(limit).toHaveBeenCalledWith(24);
  });
});
