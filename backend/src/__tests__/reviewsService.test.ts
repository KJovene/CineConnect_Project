const mockDb = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../db/index.js", () => ({ db: mockDb }));

import {
  FilmNotFoundError,
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  ReplyDepthExceededError,
  getFilmComments,
  createFilmComment,
  upsertFilmRating,
  getFilmRatingSummary,
  getLatestCommunityReviews,
  getUserCommentReplyNotifications,
  createReviewReply,
  updateReviewComment,
  deleteReviewComment,
} from "../services/reviewsService.js";

function selectWhereLimitResult(result: unknown) {
  return {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(result),
      }),
    }),
  };
}

describe("reviewsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getFilmComments throw FilmNotFoundError si film absent", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([]));

    await expect(getFilmComments("tt1")).rejects.toBeInstanceOf(
      FilmNotFoundError,
    );
  });

  it("getFilmComments retourne commentaires parents avec replies", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );

    const parentRows = [
      {
        review_id: 1,
        user_id: 2,
        film_id: 10,
        parent_review_id: null,
        rating: 4,
        comment: "Top",
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        updated_at: new Date("2024-01-01T00:00:00.000Z"),
        user_name: "Bob",
        user_image: null,
      },
      {
        review_id: 2,
        user_id: 3,
        film_id: 10,
        parent_review_id: null,
        rating: 5,
        comment: "   ",
        created_at: new Date(),
        updated_at: new Date(),
        user_name: null,
        user_image: null,
      },
    ];

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue(parentRows),
          }),
        }),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                review_id: 4,
                user_id: 5,
                film_id: 10,
                parent_review_id: 1,
                rating: 0,
                comment: "Reply",
                created_at: new Date("2024-01-02T00:00:00.000Z"),
                updated_at: new Date("2024-01-02T00:00:00.000Z"),
                user_name: "Alice",
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await getFilmComments("tt1");

    expect(result).toHaveLength(1);
    expect(result[0].reviewId).toBe(1);
    expect(result[0].author.name).toBe("Bob");
    expect(result[0].replies).toHaveLength(1);
    expect(result[0].replies[0].parentReviewId).toBe(1);
  });

  it("getFilmComments ignore replies sans parent et garde replies vides", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                review_id: 1,
                user_id: 2,
                film_id: 10,
                parent_review_id: null,
                rating: 4,
                comment: "Top",
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: new Date("2024-01-01T00:00:00.000Z"),
                user_name: "Bob",
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                review_id: 99,
                user_id: 2,
                film_id: 10,
                parent_review_id: null,
                rating: 0,
                comment: "oops",
                created_at: new Date(),
                updated_at: new Date(),
                user_name: "Alice",
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await getFilmComments("tt1");

    expect(result[0].replies).toEqual([]);
  });

  it("getFilmComments retourne vide quand aucun parent commentaire", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                review_id: 1,
                user_id: 2,
                film_id: 10,
                parent_review_id: null,
                rating: 4,
                comment: "   ",
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: null,
                user_name: null,
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await getFilmComments("tt1");

    expect(result).toEqual([]);
  });

  it("getFilmComments couvre fallback comment null", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockResolvedValue([
              {
                review_id: 1,
                user_id: 2,
                film_id: 10,
                parent_review_id: null,
                rating: 4,
                comment: null,
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: null,
                user_name: null,
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await getFilmComments("tt1");

    expect(result).toEqual([]);
  });

  it("createFilmComment refuse commentaire vide", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );

    await expect(
      createFilmComment({ omdbId: "tt1", userId: 1, comment: "   " }),
    ).rejects.toThrow("Le commentaire ne peut pas être vide");
  });

  it("createFilmComment cree un nouveau parent", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );
    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ review_id: 101 }]),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                review_id: 101,
                user_id: 1,
                film_id: 10,
                parent_review_id: null,
                rating: 4,
                comment: "new",
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: new Date("2024-01-03T00:00:00.000Z"),
                user_name: null,
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await createFilmComment({
      omdbId: "tt1",
      userId: 1,
      comment: "new",
      rating: 4,
    });

    expect(result.reviewId).toBe(101);
    expect(result.replies).toEqual([]);
    expect(result.author.name).toBe("Utilisateur");
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it("createFilmComment met rating a 0 si rating absent", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );
    const values = jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ review_id: 102 }]),
    });
    mockDb.insert.mockReturnValue({ values });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                review_id: 102,
                user_id: 1,
                film_id: 10,
                parent_review_id: null,
                rating: 0,
                comment: "new",
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: new Date("2024-01-03T00:00:00.000Z"),
                user_name: "Bob",
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    await createFilmComment({ omdbId: "tt1", userId: 1, comment: "new" });

    const valuesArg = values.mock.calls[0][0] as { rating: number };
    expect(valuesArg.rating).toBe(0);
  });

  it("createFilmComment cree puis throw ReviewNotFoundError si select vide", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ review_id: 8 }]),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }),
        }),
      }),
    });

    await expect(
      createFilmComment({ omdbId: "tt1", userId: 1, comment: "hello" }),
    ).rejects.toBeInstanceOf(ReviewNotFoundError);
  });

  it("upsertFilmRating met a jour si parent existe", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 30,
          user_id: 1,
          film_id: 9,
          parent_review_id: null,
          rating: 2,
          comment: null,
        },
      ]),
    );

    const where = jest.fn().mockResolvedValue(undefined);
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where }),
    });

    await upsertFilmRating({ omdbId: "tt9", userId: 1, rating: 5 });
    expect(mockDb.update).toHaveBeenCalledTimes(1);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it("upsertFilmRating insere si parent absent", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([]));

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    });

    await upsertFilmRating({ omdbId: "tt9", userId: 1, rating: 4 });
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it("upsertFilmRating throw si rating invalide", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));

    await expect(
      upsertFilmRating({ omdbId: "tt9", userId: 1, rating: 99 }),
    ).rejects.toThrow("La note doit être un entier entre 1 et 5");
  });

  it("getFilmRatingSummary retourne null average et userRating selon parent", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ averageRating: null, totalRatings: 0 }]),
      }),
    });

    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 1,
          user_id: 1,
          film_id: 9,
          parent_review_id: null,
          rating: 0,
          comment: null,
        },
      ]),
    );

    const result = await getFilmRatingSummary({ omdbId: "tt9", userId: 1 });

    expect(result).toEqual({
      averageRating: null,
      totalRatings: 0,
      userRating: null,
    });
  });

  it("getFilmRatingSummary mappe average numerique sans userId", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ averageRating: "4.25", totalRatings: 7 }]),
      }),
    });

    const result = await getFilmRatingSummary({ omdbId: "tt9" });

    expect(result).toEqual({
      averageRating: 4.25,
      totalRatings: 7,
      userRating: null,
    });
  });

  it("getFilmRatingSummary retourne userRating > 0", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([{ averageRating: "4.25", totalRatings: 7 }]),
      }),
    });
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 1,
          user_id: 1,
          film_id: 9,
          parent_review_id: null,
          rating: 5,
          comment: null,
        },
      ]),
    );

    const result = await getFilmRatingSummary({ omdbId: "tt9", userId: 1 });

    expect(result.userRating).toBe(5);
  });

  it("getFilmRatingSummary couvre mapReview dates nulles via createFilmComment", async () => {
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([{ film_id: 10 }]),
    );

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ review_id: 77 }]),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                review_id: 77,
                user_id: 1,
                film_id: 10,
                parent_review_id: null,
                rating: 0,
                comment: null,
                created_at: null,
                updated_at: null,
                user_name: null,
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const created = await createFilmComment({
      omdbId: "tt1",
      userId: 1,
      comment: "ok",
    });

    expect(created.comment).toBe("");
    expect(created.createdAt).toBeNull();
    expect(created.updatedAt).toBeNull();
  });

  it("getFilmRatingSummary applique totalRatings fallback 0", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 9 }]));
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest
          .fn()
          .mockResolvedValue([
            { averageRating: undefined, totalRatings: undefined },
          ]),
      }),
    });

    const result = await getFilmRatingSummary({ omdbId: "tt9" });

    expect(result.averageRating).toBeNull();
    expect(result.totalRatings).toBe(0);
  });

  it("getLatestCommunityReviews normalise limit et mappe", async () => {
    const limit = jest.fn().mockResolvedValue([
      {
        review_id: 1,
        rating: 4,
        comment: null,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        user_id: 2,
        user_name: null,
        user_image: null,
        film_omdb_id: null,
        film_title: "Film",
      },
    ]);

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });

    const result = await getLatestCommunityReviews(999);

    expect(limit).toHaveBeenCalledWith(12);
    expect(result[0].comment).toBe("");
    expect(result[0].author.name).toBe("Utilisateur");
    expect(result[0].film.omdbId).toBe("");
  });

  it("getLatestCommunityReviews utilise la limite par defaut et mappe createdAt null", async () => {
    const limit = jest.fn().mockResolvedValue([
      {
        review_id: 1,
        rating: 4,
        comment: "ok",
        created_at: null,
        user_id: 2,
        user_name: "Bob",
        user_image: null,
        film_omdb_id: "tt1",
        film_title: "Film",
      },
    ]);

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });

    const result = await getLatestCommunityReviews();

    expect(limit).toHaveBeenCalledWith(4);
    expect(result[0].createdAt).toBeNull();
  });

  it("getLatestCommunityReviews utilise effective_rating quand le commentaire a rating 0", async () => {
    const limit = jest.fn().mockResolvedValue([
      {
        review_id: 42,
        rating: 0,
        effective_rating: 5,
        comment: "Excellent film",
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        user_id: 2,
        user_name: "Bob",
        user_image: null,
        film_omdb_id: "tt1",
        film_title: "Film",
      },
    ]);

    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });

    const result = await getLatestCommunityReviews(4);

    expect(result[0].rating).toBe(5);
  });

  it("getUserCommentReplyNotifications retourne [] sans parent", async () => {
    mockDb.select.mockReturnValueOnce({
      from: jest
        .fn()
        .mockReturnValue({ where: jest.fn().mockResolvedValue([]) }),
    });

    const result = await getUserCommentReplyNotifications({
      userId: 1,
      limit: 20,
    });
    expect(result).toEqual([]);
  });

  it("getUserCommentReplyNotifications filtre parent null et mappe", async () => {
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ review_id: 10 }]),
      }),
    });

    const limit = jest.fn().mockResolvedValue([
      {
        reply_review_id: 20,
        parent_review_id: 10,
        film_omdb_id: null,
        film_title: "Film",
        comment: null,
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        replier_id: 2,
        replier_name: null,
        replier_image: null,
      },
      {
        reply_review_id: 21,
        parent_review_id: null,
        film_omdb_id: "tt",
        film_title: "Ignored",
        comment: "x",
        created_at: new Date(),
        replier_id: 3,
        replier_name: "X",
        replier_image: null,
      },
    ]);

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });

    const result = await getUserCommentReplyNotifications({
      userId: 1,
      limit: 999,
    });

    expect(limit).toHaveBeenCalledWith(100);
    expect(result).toHaveLength(1);
    expect(result[0].replier.name).toBe("Utilisateur");
    expect(result[0].comment).toBe("");
  });

  it("getUserCommentReplyNotifications applique limit par defaut et createdAt null", async () => {
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ review_id: 10 }]),
      }),
    });

    const limit = jest.fn().mockResolvedValue([
      {
        reply_review_id: 20,
        parent_review_id: 10,
        film_omdb_id: "tt1",
        film_title: "Film",
        comment: "ok",
        created_at: null,
        replier_id: 2,
        replier_name: "Bob",
        replier_image: null,
      },
    ]);

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({ limit }),
            }),
          }),
        }),
      }),
    });

    const result = await getUserCommentReplyNotifications({ userId: 1 });

    expect(limit).toHaveBeenCalledWith(20);
    expect(result[0].createdAt).toBeNull();
  });

  it("createReviewReply throw si parent absent", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([]));

    await expect(
      createReviewReply({
        omdbId: "tt3",
        userId: 1,
        parentReviewId: 7,
        comment: "ok",
      }),
    ).rejects.toBeInstanceOf(ReviewNotFoundError);
  });

  it("createReviewReply throw si profondeur depassee", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 7,
          user_id: 2,
          film_id: 3,
          parent_review_id: 1,
          rating: 0,
          comment: "x",
        },
      ]),
    );

    await expect(
      createReviewReply({
        omdbId: "tt3",
        userId: 1,
        parentReviewId: 7,
        comment: "ok",
      }),
    ).rejects.toBeInstanceOf(ReplyDepthExceededError);
  });

  it("createReviewReply throw si commentaire vide", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 7,
          user_id: 2,
          film_id: 3,
          parent_review_id: null,
          rating: 0,
          comment: "x",
        },
      ]),
    );

    await expect(
      createReviewReply({
        omdbId: "tt3",
        userId: 1,
        parentReviewId: 7,
        comment: "   ",
      }),
    ).rejects.toThrow("La réponse ne peut pas être vide");
  });

  it("createReviewReply reussit et mappe la reponse", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 7,
          user_id: 2,
          film_id: 3,
          parent_review_id: null,
          rating: 0,
          comment: "x",
        },
      ]),
    );

    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ review_id: 15 }]),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                review_id: 15,
                user_id: 1,
                film_id: 3,
                parent_review_id: 7,
                rating: 0,
                comment: "hello",
                created_at: new Date("2024-01-01T00:00:00.000Z"),
                updated_at: new Date("2024-01-01T00:00:00.000Z"),
                user_name: "Me",
                user_image: null,
              },
            ]),
          }),
        }),
      }),
    });

    const result = await createReviewReply({
      omdbId: "tt3",
      userId: 1,
      parentReviewId: 7,
      comment: "hello",
    });

    expect(result.reviewId).toBe(15);
    expect(result.parentReviewId).toBe(7);
  });

  it("updateReviewComment throw not found", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([]));

    await expect(
      updateReviewComment({
        omdbId: "tt3",
        userId: 1,
        reviewId: 2,
        comment: "x",
      }),
    ).rejects.toBeInstanceOf(ReviewNotFoundError);
  });

  it("updateReviewComment throw forbidden", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 2,
          user_id: 999,
          film_id: 3,
          parent_review_id: null,
          rating: 2,
          comment: "x",
        },
      ]),
    );

    await expect(
      updateReviewComment({
        omdbId: "tt3",
        userId: 1,
        reviewId: 2,
        comment: "x",
      }),
    ).rejects.toBeInstanceOf(ForbiddenReviewActionError);
  });

  it("updateReviewComment throw commentaire vide", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 2,
          user_id: 1,
          film_id: 3,
          parent_review_id: null,
          rating: 2,
          comment: "x",
        },
      ]),
    );

    await expect(
      updateReviewComment({
        omdbId: "tt3",
        userId: 1,
        reviewId: 2,
        comment: "   ",
      }),
    ).rejects.toThrow("Le commentaire ne peut pas être vide");
  });

  it("updateReviewComment reussit", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 2,
          user_id: 1,
          film_id: 3,
          parent_review_id: null,
          rating: 2,
          comment: "x",
        },
      ]),
    );

    mockDb.update.mockReturnValue({
      set: jest
        .fn()
        .mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    });

    await updateReviewComment({
      omdbId: "tt3",
      userId: 1,
      reviewId: 2,
      comment: "ok",
    });

    expect(mockDb.update).toHaveBeenCalledTimes(1);
  });

  it("deleteReviewComment throw not found", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([]));

    await expect(
      deleteReviewComment({ omdbId: "tt3", userId: 1, reviewId: 2 }),
    ).rejects.toBeInstanceOf(ReviewNotFoundError);
  });

  it("deleteReviewComment throw forbidden", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 2,
          user_id: 4,
          film_id: 3,
          parent_review_id: null,
          rating: 2,
          comment: "x",
        },
      ]),
    );

    await expect(
      deleteReviewComment({ omdbId: "tt3", userId: 1, reviewId: 2 }),
    ).rejects.toBeInstanceOf(ForbiddenReviewActionError);
  });

  it("deleteReviewComment reussit", async () => {
    mockDb.select.mockReturnValueOnce(selectWhereLimitResult([{ film_id: 3 }]));
    mockDb.select.mockReturnValueOnce(
      selectWhereLimitResult([
        {
          review_id: 2,
          user_id: 1,
          film_id: 3,
          parent_review_id: null,
          rating: 2,
          comment: "x",
        },
      ]),
    );

    mockDb.delete.mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });

    await deleteReviewComment({ omdbId: "tt3", userId: 1, reviewId: 2 });

    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });
});
