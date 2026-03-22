import express from "express";
import request from "supertest";

let sessionUserId: unknown = "1";

const mockFilmsService = {
  searchFilms: jest.fn(),
  getFilmDetail: jest.fn(),
  getTopRatedFilms: jest.fn(),
  getFilmsByGenre: jest.fn(),
};

const mockReviewsService = {
  getFilmRatingSummary: jest.fn(),
  getLatestCommunityReviews: jest.fn(),
};

jest.mock("../services/filmsService.js", () => mockFilmsService);
jest.mock("../services/reviewsService.js", () => mockReviewsService);
jest.mock("../routes/reviews.js", () => {
  const router = express.Router({ mergeParams: true });
  router.get("/", (_req, res) => res.json([{ reviewId: 1 }]));
  return { __esModule: true, default: router };
});

jest.mock("../middlewares/authMiddleware.js", () => ({
  attachSession: (req: any, _res: any, next: any) => {
    req.session = { user: { id: sessionUserId } };
    next();
  },
}));

import filmsRouter from "../routes/films.js";

describe("films routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/films", filmsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
    sessionUserId = "1";
  });

  it("GET /search retourne 400 si query courte", async () => {
    const res = await request(app).get("/api/films/search?q=ab");
    expect(res.status).toBe(400);
  });

  it("GET /search retourne data", async () => {
    mockFilmsService.searchFilms.mockResolvedValue({
      results: [],
      totalResults: 0,
      page: 1,
    });
    const res = await request(app).get("/api/films/search?q=abc&page=2");
    expect(res.status).toBe(200);
  });

  it("GET /search retourne 500 en erreur", async () => {
    mockFilmsService.searchFilms.mockRejectedValue(new Error("x"));
    const res = await request(app).get("/api/films/search?q=abcd");
    expect(res.status).toBe(500);
  });

  it("GET /by-genre retourne data", async () => {
    mockFilmsService.getFilmsByGenre.mockResolvedValue([]);
    const res = await request(app).get("/api/films/by-genre?limit=6");
    expect(res.status).toBe(200);
  });

  it("GET /by-genre retourne 500", async () => {
    mockFilmsService.getFilmsByGenre.mockRejectedValue(new Error("x"));
    const res = await request(app).get("/api/films/by-genre");
    expect(res.status).toBe(500);
  });

  it("GET /top-rated retourne data", async () => {
    mockFilmsService.getTopRatedFilms.mockResolvedValue([]);
    const res = await request(app).get("/api/films/top-rated?limit=5");
    expect(res.status).toBe(200);
  });

  it("GET /top-rated retourne 500", async () => {
    mockFilmsService.getTopRatedFilms.mockRejectedValue(new Error("x"));
    const res = await request(app).get("/api/films/top-rated");
    expect(res.status).toBe(500);
  });

  it("GET /community-reviews retourne data", async () => {
    mockReviewsService.getLatestCommunityReviews.mockResolvedValue([]);
    const res = await request(app).get("/api/films/community-reviews?limit=2");
    expect(res.status).toBe(200);
  });

  it("GET /community-reviews retourne 500", async () => {
    mockReviewsService.getLatestCommunityReviews.mockRejectedValue(
      new Error("x"),
    );
    const res = await request(app).get("/api/films/community-reviews");
    expect(res.status).toBe(500);
  });

  it("GET /:omdbId retourne 404 si film absent", async () => {
    mockFilmsService.getFilmDetail.mockResolvedValue(null);
    const res = await request(app).get("/api/films/tt1");
    expect(res.status).toBe(404);
  });

  it("GET /:omdbId retourne film enrichi", async () => {
    mockFilmsService.getFilmDetail.mockResolvedValue({
      omdb_id: "tt1",
      title: "A",
    });
    mockReviewsService.getFilmRatingSummary.mockResolvedValue({
      averageRating: 4,
      totalRatings: 2,
      userRating: 5,
    });

    const res = await request(app).get("/api/films/tt1");

    expect(res.status).toBe(200);
    expect(res.body.average_rating).toBe(4);
    expect(res.body.ratings_count).toBe(2);
    expect(res.body.user_rating).toBe(5);
  });

  it("GET /:omdbId passe userId undefined si id session non numerique", async () => {
    sessionUserId = "abc";
    mockFilmsService.getFilmDetail.mockResolvedValue({
      omdb_id: "tt1",
      title: "A",
    });
    mockReviewsService.getFilmRatingSummary.mockResolvedValue({
      averageRating: null,
      totalRatings: 0,
      userRating: null,
    });

    const res = await request(app).get("/api/films/tt1");

    expect(res.status).toBe(200);
    expect(mockReviewsService.getFilmRatingSummary).toHaveBeenCalledWith({
      omdbId: "tt1",
      userId: undefined,
    });
  });

  it("GET /:omdbId passe userId undefined si session absente", async () => {
    sessionUserId = undefined;
    mockFilmsService.getFilmDetail.mockResolvedValue({
      omdb_id: "tt1",
      title: "A",
    });
    mockReviewsService.getFilmRatingSummary.mockResolvedValue({
      averageRating: null,
      totalRatings: 0,
      userRating: null,
    });

    const res = await request(app).get("/api/films/tt1");

    expect(res.status).toBe(200);
    expect(mockReviewsService.getFilmRatingSummary).toHaveBeenCalledWith({
      omdbId: "tt1",
      userId: undefined,
    });
  });

  it("GET /:omdbId retourne 500 si erreur", async () => {
    mockFilmsService.getFilmDetail.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/films/tt1");

    expect(res.status).toBe(500);
  });

  it("router neste /:omdbId/reviews", async () => {
    const res = await request(app).get("/api/films/tt1/reviews");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ reviewId: 1 }]);
  });
});
