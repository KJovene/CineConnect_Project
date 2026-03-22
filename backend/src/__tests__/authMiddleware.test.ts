import type { Request, Response, NextFunction } from "express";

jest.mock("../auth.js", () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

import { auth } from "../auth.js";
import {
  attachSession,
  requireAuth,
  type RequestWithSession,
} from "../middlewares/authMiddleware.js";

describe("authMiddleware", () => {
  const getSessionMock = auth.api.getSession as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("attachSession attache une session quand getSession retourne des donnees", async () => {
    const req = {
      headers: { cookie: "a=b", "x-test": ["v1", "v2"] },
    } as unknown as RequestWithSession;
    const next = jest.fn() as NextFunction;

    getSessionMock.mockResolvedValue({
      user: { id: "1", name: "Alice", email: "a@a.com", image: undefined },
      session: {
        id: "s1",
        userId: "1",
        token: "t",
        expiresAt: new Date("2024-01-01"),
      },
    });

    await attachSession(req, {} as Response, next);

    expect(req.session).toEqual({
      user: { id: "1", name: "Alice", email: "a@a.com", image: null },
      session: {
        id: "s1",
        userId: "1",
        token: "t",
        expiresAt: new Date("2024-01-01"),
      },
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    const headersArg = getSessionMock.mock.calls[0][0].headers as Headers;
    expect(headersArg.get("cookie")).toBe("a=b");
    expect(headersArg.get("x-test")).toBe("v1, v2");
  });

  it("attachSession met session a null quand getSession retourne null", async () => {
    const req = {
      headers: { "x-optional": undefined },
    } as unknown as RequestWithSession;
    const next = jest.fn() as NextFunction;
    getSessionMock.mockResolvedValue(null);

    await attachSession(req, {} as Response, next);

    expect(req.session).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
    const headersArg = getSessionMock.mock.calls[0][0].headers as Headers;
    expect(headersArg.get("x-optional")).toBeNull();
  });

  it("attachSession met session a null quand getSession leve une exception", async () => {
    const req = { headers: {} } as unknown as RequestWithSession;
    const next = jest.fn() as NextFunction;
    getSessionMock.mockRejectedValue(new Error("boom"));

    await attachSession(req, {} as Response, next);

    expect(req.session).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("requireAuth renvoie 401 si aucune session utilisateur", () => {
    const req = { session: null } as unknown as RequestWithSession;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Non authentifié" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth appelle next quand session presente", () => {
    const req = {
      session: {
        user: { id: "1", name: "Alice", email: "a@a.com", image: null },
        session: { id: "s1", userId: "1", token: "t", expiresAt: new Date() },
      },
    } as unknown as RequestWithSession;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
