const mockDb = {
  select: jest.fn(),
};

jest.mock("../db/index.js", () => ({ db: mockDb }));

import {
  findLatestCommentsByUserId,
  findLatestRatingsByUserId,
  findUserRelationsWithOthers,
  findUsersBySearch,
} from "./usersRepository.js";

describe("usersRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function setupSelectChainWithLimit<T>(rows: T[]) {
    const limit = jest.fn().mockResolvedValue(rows);
    const orderBy = jest.fn().mockReturnValue({ limit });
    const where = jest.fn().mockReturnValue({ orderBy });
    const innerJoin = jest.fn().mockReturnValue({ where });
    const from = jest.fn().mockReturnValue({ innerJoin });

    mockDb.select.mockReturnValue({ from });

    return { limit, orderBy, where, innerJoin, from };
  }

  it("findLatestRatingsByUserId retourne les lignes et applique la limite", async () => {
    const rows = [
      {
        reviewId: 1,
        filmId: 2,
        omdbId: "tt1",
        filmTitle: "Film A",
        posterUrl: null,
        rating: 8,
        createdAt: new Date("2026-03-01T10:00:00.000Z"),
      },
    ];
    const { limit } = setupSelectChainWithLimit(rows);

    const result = await findLatestRatingsByUserId(5, 20);

    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(20);
    expect(result).toEqual(rows);
  });

  it("findLatestCommentsByUserId retourne les lignes et applique la limite", async () => {
    const rows = [
      {
        reviewId: 10,
        filmId: 3,
        omdbId: "tt2",
        filmTitle: "Film B",
        posterUrl: "https://img",
        comment: "Top",
        parentReviewId: null,
        createdAt: new Date("2026-03-02T10:00:00.000Z"),
      },
    ];
    const { limit } = setupSelectChainWithLimit(rows);

    const result = await findLatestCommentsByUserId(8, 7);

    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(7);
    expect(result).toEqual(rows);
  });

  it("findUsersBySearch retourne les utilisateurs trouvés", async () => {
    const rows = [{ id: 1, name: "Alice", email: "a@a.com", image: null }];
    const limit = jest.fn().mockResolvedValue(rows);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    mockDb.select.mockReturnValue({ from });

    const result = await findUsersBySearch("ali", 15);

    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(limit).toHaveBeenCalledWith(15);
    expect(result).toEqual(rows);
  });

  it("findUserRelationsWithOthers retourne [] si otherIds est vide", async () => {
    const result = await findUserRelationsWithOthers(1, []);

    expect(result).toEqual([]);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  it("findUserRelationsWithOthers retourne les relations pour des ids donnés", async () => {
    const rows = [{ user_id: 1, friend_user_id: 2, status: "accepted" }];
    const where = jest.fn().mockResolvedValue(rows);
    const from = jest.fn().mockReturnValue({ where });

    mockDb.select.mockReturnValue({ from });

    const result = await findUserRelationsWithOthers(1, [2, 3]);

    expect(mockDb.select).toHaveBeenCalledTimes(1);
    expect(result).toEqual(rows);
  });
});
