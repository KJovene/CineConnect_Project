import express from "express";
import request from "supertest";

const mockDb = {
  select: jest.fn(),
};

const mockReviewsService = {
  getUserCommentReplyNotifications: jest.fn(),
};

jest.mock("../db/index.js", () => ({ db: mockDb }));
jest.mock("../services/reviewsService.js", () => mockReviewsService);

jest.mock("../middlewares/authMiddleware.js", () => ({
  attachSession: (req: any, _res: any, next: any) => {
    req.session = { user: { id: "1" } };
    next();
  },
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

import usersRouter from "./users.js";

describe("users routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/users", usersRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /me/latest-ratings mappe les dates", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  reviewId: 1,
                  filmId: 2,
                  omdbId: "tt1",
                  filmTitle: "A",
                  posterUrl: null,
                  rating: 5,
                  createdAt: new Date("2024-01-01T00:00:00.000Z"),
                },
              ]),
            }),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/users/me/latest-ratings");

    expect(res.status).toBe(200);
    expect(res.body[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("GET /me/latest-ratings mappe createdAt null", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  reviewId: 1,
                  filmId: 2,
                  omdbId: "tt1",
                  filmTitle: "A",
                  posterUrl: null,
                  rating: 5,
                  createdAt: null,
                },
              ]),
            }),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/users/me/latest-ratings");

    expect(res.status).toBe(200);
    expect(res.body[0].createdAt).toBeNull();
  });

  it("GET /me/latest-ratings retourne 500 en erreur", async () => {
    mockDb.select.mockImplementation(() => {
      throw new Error("x");
    });

    const res = await request(app).get("/api/users/me/latest-ratings");

    expect(res.status).toBe(500);
  });

  it("GET /me/latest-comments mappe isReply", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  reviewId: 1,
                  filmId: 2,
                  omdbId: "tt1",
                  filmTitle: "A",
                  posterUrl: null,
                  comment: null,
                  parentReviewId: 9,
                  createdAt: null,
                },
              ]),
            }),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/users/me/latest-comments");

    expect(res.status).toBe(200);
    expect(res.body[0].isReply).toBe(true);
    expect(res.body[0].comment).toBe("");
  });

  it("GET /me/latest-comments mappe createdAt string", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([
                {
                  reviewId: 1,
                  filmId: 2,
                  omdbId: "tt1",
                  filmTitle: "A",
                  posterUrl: null,
                  comment: "ok",
                  parentReviewId: null,
                  createdAt: new Date("2024-01-01T00:00:00.000Z"),
                },
              ]),
            }),
          }),
        }),
      }),
    });

    const res = await request(app).get("/api/users/me/latest-comments");

    expect(res.status).toBe(200);
    expect(res.body[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(res.body[0].isReply).toBe(false);
  });

  it("GET /me/latest-comments retourne 500 en erreur", async () => {
    mockDb.select.mockImplementation(() => {
      throw new Error("x");
    });

    const res = await request(app).get("/api/users/me/latest-comments");

    expect(res.status).toBe(500);
  });

  it("GET /me/comment-replies retourne les notifications", async () => {
    mockReviewsService.getUserCommentReplyNotifications.mockResolvedValue([
      { replyReviewId: 1 },
    ]);

    const res = await request(app).get("/api/users/me/comment-replies?limit=3");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ replyReviewId: 1 }]);
  });

  it("GET /me/comment-replies retourne 500 en erreur", async () => {
    mockReviewsService.getUserCommentReplyNotifications.mockRejectedValue(
      new Error("x"),
    );

    const res = await request(app).get("/api/users/me/comment-replies");

    expect(res.status).toBe(500);
  });

  it("GET / retourne [] si recherche trop courte", async () => {
    const res = await request(app).get("/api/users?search=a");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET / retourne [] sans query search", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET / retourne [] si seulement soi-meme", async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockResolvedValue([
              { id: 1, name: "Me", email: "m", image: null },
            ]),
        }),
      }),
    });

    const res = await request(app).get("/api/users?search=me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET / mappe relationStatus", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { id: 1, name: "Me", email: "m", image: null },
              { id: 2, name: "Bob", email: "b", image: null },
            ]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockResolvedValue([
              { user_id: 1, friend_user_id: 2, status: "accepted" },
            ]),
        }),
      });

    const res = await request(app).get("/api/users?search=bo");

    expect(res.status).toBe(200);
    expect(res.body[0].relationStatus).toBe("accepted");
  });

  it("GET / mappe statut pending et relationStatus null", async () => {
    mockDb.select
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              { id: 1, name: "Me", email: "m", image: null },
              { id: 2, name: "Bob", email: "b", image: null },
              { id: 3, name: "Eve", email: "e", image: null },
            ]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest
            .fn()
            .mockResolvedValue([
              { user_id: 2, friend_user_id: 1, status: null },
            ]),
        }),
      });

    const res = await request(app).get("/api/users?search=bo");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].relationStatus).toBe("pending");
    expect(res.body[1].relationStatus).toBeNull();
  });

  it("GET / retourne 500 en erreur", async () => {
    mockDb.select.mockImplementation(() => {
      throw new Error("x");
    });

    const res = await request(app).get("/api/users?search=bob");

    expect(res.status).toBe(500);
  });
});
