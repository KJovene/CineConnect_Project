const mockDb = {
  select: jest.fn(),
};

jest.mock("../db/index.js", () => ({ db: mockDb }));

jest.mock("./filmsService.js", () => ({
  withCommunityRatings: jest.fn((items: unknown[]) => Promise.resolve(items)),
}));

import {
  getAllCategories,
  getFilmsByCategory,
  getFilmsByAllCategories,
} from "./categoriesService.js";

describe("categoriesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getAllCategories
  describe("getAllCategories", () => {
    it("retourne la liste des catégories triées par nom", async () => {
      const mockCategories = [
        { category_id: 1, name: "Action", description: null },
        { category_id: 2, name: "Drama", description: null },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(mockCategories),
        }),
      });

      const result = await getAllCategories();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Action");
      expect(result[1].name).toBe("Drama");
    });

    it("retourne un tableau vide si aucune catégorie", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await getAllCategories();

      expect(result).toEqual([]);
    });
  });

  // getFilmsByCategory
  describe("getFilmsByCategory", () => {
    it("retourne les films d'une catégorie via la junction table", async () => {
      const mockFilms = [
        { film_id: 1, omdb_id: "tt1", title: "The Dark Knight", type: "movie" },
        { film_id: 2, omdb_id: "tt2", title: "Inception", type: "movie" },
      ];

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue(mockFilms),
              }),
            }),
          }),
        }),
      });

      const result = await getFilmsByCategory(1);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("The Dark Knight");
    });

    it("utilise la limite par défaut de 24", async () => {
      const limit = jest.fn().mockResolvedValue([]);

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      });

      await getFilmsByCategory(1);

      expect(limit).toHaveBeenCalledWith(24);
    });

    it("respecte la limite passée en paramètre", async () => {
      const limit = jest.fn().mockResolvedValue([]);

      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      });

      await getFilmsByCategory(1, 10);

      expect(limit).toHaveBeenCalledWith(10);
    });

    it("retourne un tableau vide si aucun film dans la catégorie", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await getFilmsByCategory(99);

      expect(result).toEqual([]);
    });
  });

  // getFilmsByAllCategories
  describe("getFilmsByAllCategories", () => {
    it("retourne les sections catégorie+films pour les catégories non vides", async () => {
      const mockCategories = [
        { category_id: 1, name: "Action", description: null },
        { category_id: 2, name: "Drama", description: null },
      ];
      const mockActionFilms = [
        { film_id: 1, omdb_id: "tt1", title: "The Dark Knight", type: "movie" },
      ];

      // Premier appel select → getAllCategories
      // Appels suivants → getFilmsByCategory pour chaque catégorie
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(mockCategories),
          }),
        })

        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue(mockActionFilms),
                }),
              }),
            }),
          }),
        })

        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        });

      const result = await getFilmsByAllCategories();

      expect(result).toHaveLength(1);
      expect(result[0].category.name).toBe("Action");
      expect(result[0].films).toHaveLength(1);
    });

    it("retourne un tableau vide si toutes les catégories sont vides", async () => {
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });

      const result = await getFilmsByAllCategories();

      expect(result).toEqual([]);
    });
  });
});
