import express from "express";
import request from "supertest";

const mockUsersService = {
  getLatestRatings: jest.fn(),
  getLatestComments: jest.fn(),
  getCommentReplies: jest.fn(),
  searchUsers: jest.fn(),
};

jest.mock("../services/usersService.js", () => mockUsersService);

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

  it("GET /me/latest-ratings retourne les donnees service", async () => {
    mockUsersService.getLatestRatings.mockResolvedValue([
      { reviewId: 1, createdAt: "2024-01-01T00:00:00.000Z" },
    ]);

    const res = await request(app).get("/api/users/me/latest-ratings");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { reviewId: 1, createdAt: "2024-01-01T00:00:00.000Z" },
    ]);
    expect(mockUsersService.getLatestRatings).toHaveBeenCalledTimes(1);
  });

  it("GET /me/latest-ratings retourne 500 en erreur", async () => {
    mockUsersService.getLatestRatings.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/users/me/latest-ratings");

    expect(res.status).toBe(500);
  });

  it("GET /me/latest-comments retourne les donnees service", async () => {
    mockUsersService.getLatestComments.mockResolvedValue([
      { reviewId: 1, isReply: true, comment: "" },
    ]);

    const res = await request(app).get("/api/users/me/latest-comments");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ reviewId: 1, isReply: true, comment: "" }]);
    expect(mockUsersService.getLatestComments).toHaveBeenCalledTimes(1);
  });

  it("GET /me/latest-comments retourne 500 en erreur", async () => {
    mockUsersService.getLatestComments.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/users/me/latest-comments");

    expect(res.status).toBe(500);
  });

  it("GET /me/comment-replies retourne les notifications", async () => {
    mockUsersService.getCommentReplies.mockResolvedValue([{ replyReviewId: 1 }]);

    const res = await request(app).get("/api/users/me/comment-replies?limit=3");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ replyReviewId: 1 }]);
    expect(mockUsersService.getCommentReplies).toHaveBeenCalledTimes(1);
  });

  it("GET /me/comment-replies retourne 500 en erreur", async () => {
    mockUsersService.getCommentReplies.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/users/me/comment-replies");

    expect(res.status).toBe(500);
  });

  it("GET / retourne [] si recherche trop courte", async () => {
    mockUsersService.searchUsers.mockResolvedValue([]);

    const res = await request(app).get("/api/users?search=a");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET / retourne [] sans query search", async () => {
    mockUsersService.searchUsers.mockResolvedValue([]);

    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET / retourne la liste recherchee", async () => {
    mockUsersService.searchUsers.mockResolvedValue([
      { id: 2, relationStatus: "accepted" },
      { id: 3, relationStatus: null },
    ]);

    const res = await request(app).get("/api/users?search=bo");

    expect(res.status).toBe(200);
    expect(res.body[0].relationStatus).toBe("accepted");
    expect(res.body[1].relationStatus).toBeNull();
  });

  it("GET / retourne 500 en erreur", async () => {
    mockUsersService.searchUsers.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/users?search=bob");

    expect(res.status).toBe(500);
  });
});
