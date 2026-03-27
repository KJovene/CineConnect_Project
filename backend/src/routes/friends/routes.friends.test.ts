import express from "express";
import request from "supertest";

let mockSessionUserId = "1";

const mockFriendsService = {
  getFriends: jest.fn(),
  getPendingRequests: jest.fn(),
  sendFriendRequest: jest.fn(),
  acceptFriendRequest: jest.fn(),
  rejectFriendRequest: jest.fn(),
  removeFriend: jest.fn(),
};

jest.mock("../../services/friends/friendsService.js", () => mockFriendsService);

jest.mock("../../middlewares/authMiddleware.js", () => ({
  attachSession: (req: any, _res: any, next: any) => {
    req.session = { user: { id: mockSessionUserId } };
    next();
  },
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

import friendsRouter from "./friends.js";

describe("friends routes", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/friends", friendsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionUserId = "1";
  });

  it("GET / retourne la liste d amis", async () => {
    mockFriendsService.getFriends.mockResolvedValue([{ friend_id: 1 }]);

    const res = await request(app).get("/api/friends");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ friend_id: 1 }]);
  });

  it("GET / retourne 500 en cas d erreur", async () => {
    mockFriendsService.getFriends.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/friends");

    expect(res.status).toBe(500);
  });

  it("GET /pending retourne les demandes", async () => {
    mockFriendsService.getPendingRequests.mockResolvedValue([{ friend_id: 1 }]);

    const res = await request(app).get("/api/friends/pending");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ friend_id: 1 }]);
  });

  it("GET /pending retourne 500 en cas d erreur", async () => {
    mockFriendsService.getPendingRequests.mockRejectedValue(new Error("x"));

    const res = await request(app).get("/api/friends/pending");

    expect(res.status).toBe(500);
  });

  it("POST /request retourne 400 si friendUserId invalide", async () => {
    const res = await request(app).post("/api/friends/request").send({});

    expect(res.status).toBe(400);
  });

  it("POST /request retourne 400 si session user id invalide", async () => {
    mockSessionUserId = "abc";

    const res = await request(app)
      .post("/api/friends/request")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("ID de session invalide");
  });

  it("POST /request retourne 201 si ok", async () => {
    mockFriendsService.sendFriendRequest.mockResolvedValue({ friend_id: 1 });

    const res = await request(app)
      .post("/api/friends/request")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ friend_id: 1 });
  });

  it("POST /request retourne 400 sur erreur service", async () => {
    mockFriendsService.sendFriendRequest.mockRejectedValue(new Error("oops"));

    const res = await request(app)
      .post("/api/friends/request")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("oops");
  });

  it("POST /request retourne message fallback sur erreur non Error", async () => {
    mockFriendsService.sendFriendRequest.mockRejectedValue("x");

    const res = await request(app)
      .post("/api/friends/request")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Erreur serveur");
  });

  it("POST /accept retourne 400 si friendUserId manquant", async () => {
    const res = await request(app).post("/api/friends/accept").send({});

    expect(res.status).toBe(400);
  });

  it("POST /accept retourne 200 si ok", async () => {
    mockFriendsService.acceptFriendRequest.mockResolvedValue({
      status: "accepted",
    });

    const res = await request(app)
      .post("/api/friends/accept")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("accepted");
  });

  it("POST /accept retourne 400 en cas d erreur", async () => {
    mockFriendsService.acceptFriendRequest.mockRejectedValue(new Error("x"));

    const res = await request(app)
      .post("/api/friends/accept")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
  });

  it("POST /accept retourne fallback sur erreur non Error", async () => {
    mockFriendsService.acceptFriendRequest.mockRejectedValue("x");

    const res = await request(app)
      .post("/api/friends/accept")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Erreur serveur");
  });

  it("POST /reject retourne 400 si friendUserId manquant", async () => {
    const res = await request(app).post("/api/friends/reject").send({});

    expect(res.status).toBe(400);
  });

  it("POST /reject retourne 200 si ok", async () => {
    mockFriendsService.rejectFriendRequest.mockResolvedValue({
      status: "rejected",
    });

    const res = await request(app)
      .post("/api/friends/reject")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
  });

  it("POST /reject retourne 400 en cas d erreur", async () => {
    mockFriendsService.rejectFriendRequest.mockRejectedValue(new Error("x"));

    const res = await request(app)
      .post("/api/friends/reject")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
  });

  it("POST /reject retourne fallback sur erreur non Error", async () => {
    mockFriendsService.rejectFriendRequest.mockRejectedValue("x");

    const res = await request(app)
      .post("/api/friends/reject")
      .send({ friendUserId: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Erreur serveur");
  });

  it("DELETE /:id retourne 204 si ok", async () => {
    mockFriendsService.removeFriend.mockResolvedValue(undefined);

    const res = await request(app).delete("/api/friends/2");

    expect(res.status).toBe(204);
  });

  it("DELETE /:id retourne 500 en cas d erreur", async () => {
    mockFriendsService.removeFriend.mockRejectedValue(new Error("x"));

    const res = await request(app).delete("/api/friends/2");

    expect(res.status).toBe(500);
  });
});
