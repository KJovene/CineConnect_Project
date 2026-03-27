import type { Response } from "express";
import type { RequestWithSession } from "../middlewares/authMiddleware.js";
import * as usersService from "../services/usersService.js";
import type { ErrorResponse, PaginationQuery } from "../types/index.js";

function internalError(): ErrorResponse {
  return { error: "Erreur serveur" };
}

export async function getLatestRatings(req: RequestWithSession, res: Response) {
  try {
    const myId = parseInt(String(req.session!.user.id), 10);
    const rows = await usersService.getLatestRatings(
      myId,
      req.query as PaginationQuery,
    );

    res.json(rows);
  } catch (_err) {
    res.status(500).json(internalError());
  }
}

export async function getLatestComments(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const myId = parseInt(String(req.session!.user.id), 10);
    const rows = await usersService.getLatestComments(
      myId,
      req.query as PaginationQuery,
    );

    res.json(rows);
  } catch (_err) {
    res.status(500).json(internalError());
  }
}

export async function getCommentReplies(
  req: RequestWithSession,
  res: Response,
) {
  try {
    const myId = parseInt(String(req.session!.user.id), 10);
    const rows = await usersService.getCommentReplies(
      myId,
      req.query as PaginationQuery,
    );
    res.json(rows);
  } catch (_err) {
    res.status(500).json(internalError());
  }
}

export async function searchUsers(req: RequestWithSession, res: Response) {
  try {
    const myId = parseInt(String(req.session!.user.id), 10);
    const search = ((req.query.search as string) ?? "").trim();

    const rows = await usersService.searchUsers(myId, search);
    res.json(rows);
  } catch (_err) {
    res.status(500).json(internalError());
  }
}
