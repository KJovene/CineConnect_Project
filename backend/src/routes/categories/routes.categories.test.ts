import express from "express";
import request from "supertest";

const mockCategoriesService = {
  getAllCategories: jest.fn(),
  getFilmsByCategory: jest.fn(),
  getFilmsByAllCategories: jest.fn(),
};

jest.mock("../../services/categories/categoriesService.js", () => mockCategoriesService);

import categoriesRouter from "./categories.js";

describe("categories routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/categories", categoriesRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //  GET /api/categories

  it("GET / retourne la liste des catégories", async () => {
    mockCategoriesService.getAllCategories.mockResolvedValue([
      { category_id: 1, name: "Action", description: null },
    ]);
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Action");
  });

  it("GET / retourne 500 en erreur", async () => {
    mockCategoriesService.getAllCategories.mockRejectedValue(new Error("x"));
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(500);
  });

  // GET /api/categories/films

  it("GET /films retourne les films groupés par catégorie", async () => {
    mockCategoriesService.getFilmsByAllCategories.mockResolvedValue([
      { category: { category_id: 1, name: "Action" }, films: [] },
    ]);
    const res = await request(app).get("/api/categories/films?limit=6");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /films retourne 500 en erreur", async () => {
    mockCategoriesService.getFilmsByAllCategories.mockRejectedValue(
      new Error("x"),
    );
    const res = await request(app).get("/api/categories/films");
    expect(res.status).toBe(500);
  });

  // GET /api/categories/:id/films

  it("GET /:id/films retourne les films d'une catégorie", async () => {
    mockCategoriesService.getFilmsByCategory.mockResolvedValue([
      { film_id: 1, title: "The Dark Knight", type: "movie" },
    ]);
    const res = await request(app).get("/api/categories/1/films?limit=10");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /:id/films retourne 400 si id non numérique", async () => {
    const res = await request(app).get("/api/categories/abc/films");
    expect(res.status).toBe(400);
  });

  it("GET /:id/films retourne 500 en erreur", async () => {
    mockCategoriesService.getFilmsByCategory.mockRejectedValue(new Error("x"));
    const res = await request(app).get("/api/categories/1/films");
    expect(res.status).toBe(500);
  });
});
