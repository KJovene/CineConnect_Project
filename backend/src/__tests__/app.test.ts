import request from "supertest";
import type { Request, Response } from "express";

const handlerMock = jest.fn();
const initSocketMock = jest.fn();

jest.mock("better-auth/node", () => ({
  toNodeHandler: jest.fn(() => handlerMock),
}));

jest.mock("../auth.js", () => ({ auth: {} }));
jest.mock("../socket.js", () => ({
  initSocket: (...args: unknown[]) => initSocketMock(...args),
}));

jest.mock("../routes/friends.js", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/", (_req: Request, res: Response) => res.json([{ ok: true }]));
  return { __esModule: true, default: router };
});

jest.mock("../routes/messages.js", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/", (_req: Request, res: Response) => res.json([{ ok: true }]));
  return { __esModule: true, default: router };
});

jest.mock("../routes/users.js", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/", (_req: Request, res: Response) => res.json([{ ok: true }]));
  return { __esModule: true, default: router };
});

jest.mock("../routes/films.js", () => {
  const express = require("express");
  const router = express.Router();
  router.get("/", (_req: Request, res: Response) => res.json([{ ok: true }]));
  return { __esModule: true, default: router };
});

import { createApp, createHttpServer } from "../app.js";

describe("app factory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createApp expose route racine", async () => {
    const app = createApp();

    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("CineConnect API is running");
  });

  it("createApp monte les routers", async () => {
    const app = createApp();

    const [friends, messages, users, films] = await Promise.all([
      request(app).get("/api/friends"),
      request(app).get("/api/messages"),
      request(app).get("/api/users"),
      request(app).get("/api/films"),
    ]);

    expect(friends.status).toBe(200);
    expect(messages.status).toBe(200);
    expect(users.status).toBe(200);
    expect(films.status).toBe(200);
  });

  it("createApp wrapAuthHandler retourne 500 quand handler plante", async () => {
    handlerMock.mockRejectedValue(new Error("auth fail"));

    const app = createApp();
    const res = await request(app).get("/api/auth");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Auth error");
  });

  it("createApp wrapAuthHandler ignore reponse si headers deja envoyes", async () => {
    handlerMock.mockImplementation(async (_req: Request, res: Response) => {
      res.status(204).send();
      throw new Error("ignored");
    });

    const app = createApp();
    const res = await request(app).get("/api/auth");

    expect(res.status).toBe(204);
  });

  it("createApp wrapAuthHandler formate un message non Error", async () => {
    handlerMock.mockRejectedValue("auth string error");

    const app = createApp();
    const res = await request(app).get("/api/auth");

    expect(res.status).toBe(500);
    expect(res.body.detail).toBe("auth string error");
  });

  it("createHttpServer cree un serveur et initialise socket", () => {
    const app = createApp();
    const server = createHttpServer(app);

    expect(server).toBeDefined();
    expect(initSocketMock).toHaveBeenCalledTimes(1);
    server.close();
  });
});
