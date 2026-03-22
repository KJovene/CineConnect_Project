import express from "express";
import request from "supertest";

class FilmNotFoundError extends Error {}
class ReviewNotFoundError extends Error {}
class ForbiddenReviewActionError extends Error {}
class ReplyDepthExceededError extends Error {}

const mockReviewsService = {
  FilmNotFoundError,
  ReviewNotFoundError,
  ForbiddenReviewActionError,
  ReplyDepthExceededError,
  getFilmComments: jest.fn(),
  getFilmRatingSummary: jest.fn(),
  upsertFilmRating: jest.fn(),
  createFilmComment: jest.fn(),
  createReviewReply: jest.fn(),
  updateReviewComment: jest.fn(),
  deleteReviewComment: jest.fn(),
};

jest.mock("../services/reviewsService.js", () => mockReviewsService);

jest.mock("../middlewares/authMiddleware.js", () => ({
  attachSession: (req: any, _res: any, next: any) => {
    req.session = { user: { id: "1" } };
    next();
  },
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

import reviewsRouter from "../routes/reviews.js";

describe("reviews routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/films/:omdbId/reviews", reviewsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET / retourne 400 si omdbId manquant", async () => {
    const res = await request(app).get("/api/films/%20/reviews");
    expect([400, 404]).toContain(res.status);
  });

  it("GET / retourne commentaires", async () => {
    mockReviewsService.getFilmComments.mockResolvedValue([{ reviewId: 1 }]);
    const res = await request(app).get("/api/films/tt1/reviews");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ reviewId: 1 }]);
  });

  it("GET / retourne 404 sur FilmNotFoundError", async () => {
    mockReviewsService.getFilmComments.mockRejectedValue(
      new FilmNotFoundError("NF"),
    );
    const res = await request(app).get("/api/films/tt1/reviews");
    expect(res.status).toBe(404);
  });

  it("GET / retourne 500 sur erreur inconnue", async () => {
    mockReviewsService.getFilmComments.mockRejectedValue("oops");
    const res = await request(app).get("/api/films/tt1/reviews");
    expect(res.status).toBe(500);
  });

  it("GET /rating-summary retourne summary avec userId invalide ignore", async () => {
    mockReviewsService.getFilmRatingSummary.mockResolvedValue({
      averageRating: null,
      totalRatings: 0,
      userRating: null,
    });
    const res = await request(app).get("/api/films/tt1/reviews/rating-summary");
    expect(res.status).toBe(200);
  });

  it("GET /rating-summary retourne 400 si omdbId manquant", async () => {
    const res = await request(app).get("/api/films/%20/reviews/rating-summary");
    expect([400, 404]).toContain(res.status);
  });

  it("GET /rating-summary retourne 404 sur FilmNotFoundError", async () => {
    mockReviewsService.getFilmRatingSummary.mockRejectedValue(
      new FilmNotFoundError("NF"),
    );
    const res = await request(app).get("/api/films/tt1/reviews/rating-summary");
    expect(res.status).toBe(404);
  });

  it("GET /rating-summary retourne 400 sur Error", async () => {
    mockReviewsService.getFilmRatingSummary.mockRejectedValue(new Error("bad"));
    const res = await request(app).get("/api/films/tt1/reviews/rating-summary");
    expect(res.status).toBe(400);
  });

  it("GET /rating-summary retourne 500 sur erreur non Error", async () => {
    mockReviewsService.getFilmRatingSummary.mockRejectedValue("x");
    const res = await request(app).get("/api/films/tt1/reviews/rating-summary");
    expect(res.status).toBe(500);
  });

  it("POST /rating retourne 400 si rating absent", async () => {
    const res = await request(app)
      .post("/api/films/tt1/reviews/rating")
      .send({});
    expect(res.status).toBe(400);
  });

  it("POST /rating retourne 400 si omdbId manquant", async () => {
    const res = await request(app)
      .post("/api/films/%20/reviews/rating")
      .send({ rating: 4 });
    expect([400, 404]).toContain(res.status);
  });

  it("POST /rating retourne summary si succes", async () => {
    mockReviewsService.upsertFilmRating.mockResolvedValue(undefined);
    mockReviewsService.getFilmRatingSummary.mockResolvedValue({
      averageRating: 4,
      totalRatings: 2,
      userRating: 4,
    });

    const res = await request(app)
      .post("/api/films/tt1/reviews/rating")
      .send({ rating: 4 });
    expect(res.status).toBe(200);
    expect(res.body.userRating).toBe(4);
  });

  it("POST /rating retourne 404 sur FilmNotFoundError", async () => {
    mockReviewsService.upsertFilmRating.mockRejectedValue(
      new FilmNotFoundError("NF"),
    );
    const res = await request(app)
      .post("/api/films/tt1/reviews/rating")
      .send({ rating: 4 });
    expect(res.status).toBe(404);
  });

  it("POST /rating retourne 400 sur Error", async () => {
    mockReviewsService.upsertFilmRating.mockRejectedValue(new Error("bad"));
    const res = await request(app)
      .post("/api/films/tt1/reviews/rating")
      .send({ rating: 4 });
    expect(res.status).toBe(400);
  });

  it("POST /rating retourne 500 sur erreur non Error", async () => {
    mockReviewsService.upsertFilmRating.mockRejectedValue("x");
    const res = await request(app)
      .post("/api/films/tt1/reviews/rating")
      .send({ rating: 4 });
    expect(res.status).toBe(500);
  });

  it("POST / retourne 400 si comment absent", async () => {
    const res = await request(app).post("/api/films/tt1/reviews").send({});
    expect(res.status).toBe(400);
  });

  it("POST / retourne 400 si omdbId manquant", async () => {
    const res = await request(app).post("/api/films/%20/reviews").send({ comment: "ok" });
    expect([400, 404]).toContain(res.status);
  });

  it("POST / retourne 201 si succes", async () => {
    mockReviewsService.createFilmComment.mockResolvedValue({ reviewId: 1 });
    const res = await request(app)
      .post("/api/films/tt1/reviews")
      .send({ comment: "ok", rating: 5 });
    expect(res.status).toBe(201);
  });

  it("POST / retourne 404 sur FilmNotFoundError", async () => {
    mockReviewsService.createFilmComment.mockRejectedValue(
      new FilmNotFoundError("nf"),
    );

    const res = await request(app)
      .post("/api/films/tt1/reviews")
      .send({ comment: "ok" });

    expect(res.status).toBe(404);
  });

  it("POST / retourne 500 sur erreur non Error", async () => {
    mockReviewsService.createFilmComment.mockRejectedValue("oops");

    const res = await request(app)
      .post("/api/films/tt1/reviews")
      .send({ comment: "ok" });

    expect(res.status).toBe(500);
  });

  it("POST / retourne 400 sur Error", async () => {
    mockReviewsService.createFilmComment.mockRejectedValue(new Error("bad"));

    const res = await request(app)
      .post("/api/films/tt1/reviews")
      .send({ comment: "ok" });

    expect(res.status).toBe(400);
  });

  it("POST /:reviewId/replies couvre 400 invalid params", async () => {
    const res = await request(app)
      .post("/api/films/tt1/reviews/abc/replies")
      .send({ comment: "ok" });
    expect(res.status).toBe(400);
  });

  it("POST /:reviewId/replies couvre 400 comment manquant", async () => {
    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({});
    expect(res.status).toBe(400);
  });

  it("POST /:reviewId/replies couvre 201 succes", async () => {
    mockReviewsService.createReviewReply.mockResolvedValue({ reviewId: 2 });

    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({ comment: "ok" });

    expect(res.status).toBe(201);
    expect(res.body.reviewId).toBe(2);
  });

  it("POST /:reviewId/replies couvre erreurs metier", async () => {
    mockReviewsService.createReviewReply.mockRejectedValue(
      new ReplyDepthExceededError("depth"),
    );
    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({ comment: "ok" });
    expect(res.status).toBe(400);
  });

  it("POST /:reviewId/replies couvre 400 Error", async () => {
    mockReviewsService.createReviewReply.mockRejectedValue(new Error("bad"));

    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({ comment: "ok" });

    expect(res.status).toBe(400);
  });

  it("POST /:reviewId/replies couvre 404 ReviewNotFoundError", async () => {
    mockReviewsService.createReviewReply.mockRejectedValue(
      new ReviewNotFoundError("nf"),
    );

    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({ comment: "ok" });

    expect(res.status).toBe(404);
  });

  it("POST /:reviewId/replies couvre 500 erreur non Error", async () => {
    mockReviewsService.createReviewReply.mockRejectedValue("x");

    const res = await request(app)
      .post("/api/films/tt1/reviews/1/replies")
      .send({ comment: "ok" });

    expect(res.status).toBe(500);
  });

  it("PATCH /:reviewId couvre 403", async () => {
    mockReviewsService.updateReviewComment.mockRejectedValue(
      new ForbiddenReviewActionError("forbidden"),
    );
    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({ comment: "ok" });
    expect(res.status).toBe(403);
  });

  it("PATCH /:reviewId couvre 400 params invalides", async () => {
    const res = await request(app)
      .patch("/api/films/tt1/reviews/abc")
      .send({ comment: "ok" });

    expect(res.status).toBe(400);
  });

  it("PATCH /:reviewId couvre 400 comment manquant", async () => {
    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({});

    expect(res.status).toBe(400);
  });

  it("PATCH /:reviewId couvre 404", async () => {
    mockReviewsService.updateReviewComment.mockRejectedValue(
      new ReviewNotFoundError("nf"),
    );

    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({ comment: "ok" });

    expect(res.status).toBe(404);
  });

  it("PATCH /:reviewId couvre 400 Error", async () => {
    mockReviewsService.updateReviewComment.mockRejectedValue(new Error("bad"));

    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({ comment: "ok" });

    expect(res.status).toBe(400);
  });

  it("PATCH /:reviewId couvre 500 erreur non Error", async () => {
    mockReviewsService.updateReviewComment.mockRejectedValue("x");

    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({ comment: "ok" });

    expect(res.status).toBe(500);
  });

  it("PATCH /:reviewId succes 204", async () => {
    mockReviewsService.updateReviewComment.mockResolvedValue(undefined);
    const res = await request(app)
      .patch("/api/films/tt1/reviews/1")
      .send({ comment: "ok" });
    expect(res.status).toBe(204);
  });

  it("DELETE /:reviewId couvre 404", async () => {
    mockReviewsService.deleteReviewComment.mockRejectedValue(
      new ReviewNotFoundError("nf"),
    );
    const res = await request(app).delete("/api/films/tt1/reviews/1");
    expect(res.status).toBe(404);
  });

  it("DELETE /:reviewId couvre 403", async () => {
    mockReviewsService.deleteReviewComment.mockRejectedValue(
      new ForbiddenReviewActionError("forbidden"),
    );
    const res = await request(app).delete("/api/films/tt1/reviews/1");
    expect(res.status).toBe(403);
  });

  it("DELETE /:reviewId couvre 400 params invalides", async () => {
    const res = await request(app).delete("/api/films/tt1/reviews/abc");
    expect(res.status).toBe(400);
  });

  it("DELETE /:reviewId couvre 500 erreur inconnue", async () => {
    mockReviewsService.deleteReviewComment.mockRejectedValue("x");

    const res = await request(app).delete("/api/films/tt1/reviews/1");

    expect(res.status).toBe(500);
  });

  it("DELETE /:reviewId succes 204", async () => {
    mockReviewsService.deleteReviewComment.mockResolvedValue(undefined);
    const res = await request(app).delete("/api/films/tt1/reviews/1");
    expect(res.status).toBe(204);
  });
});
