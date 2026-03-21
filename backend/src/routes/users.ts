import { Router } from "express";
import {
  attachSession,
  requireAuth,
  type RequestWithSession,
} from "../middlewares/authMiddleware.js";
import { db } from "../db/index.js";
import { user, friends, reviews, films } from "../db/schema.js";
import { ilike, or, and, eq, inArray, desc, isNull, sql } from "drizzle-orm";

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/users/me/latest-ratings — dernières notes de l'utilisateur connecté
router.get("/me/latest-ratings", async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(String(req.session!.user.id));

    const rows = await db
      .select({
        reviewId: reviews.review_id,
        filmId: reviews.film_id,
        omdbId: films.omdb_id,
        filmTitle: films.title,
        posterUrl: films.poster_url,
        rating: reviews.rating,
        createdAt: reviews.created_at,
      })
      .from(reviews)
      .innerJoin(films, eq(reviews.film_id, films.film_id))
      .where(
        and(
          eq(reviews.user_id, myId),
          isNull(reviews.parent_review_id),
          sql`${reviews.rating} > 0`,
        ),
      )
      .orderBy(desc(reviews.created_at))
      .limit(5);

    res.json(
      rows.map((row) => ({
        reviewId: row.reviewId,
        filmId: row.filmId,
        omdbId: row.omdbId,
        filmTitle: row.filmTitle,
        posterUrl: row.posterUrl,
        rating: row.rating,
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users/me/latest-comments — derniers commentaires de l'utilisateur connecté
router.get("/me/latest-comments", async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(String(req.session!.user.id));

    const rows = await db
      .select({
        reviewId: reviews.review_id,
        filmId: reviews.film_id,
        omdbId: films.omdb_id,
        filmTitle: films.title,
        posterUrl: films.poster_url,
        comment: reviews.comment,
        parentReviewId: reviews.parent_review_id,
        createdAt: reviews.created_at,
      })
      .from(reviews)
      .innerJoin(films, eq(reviews.film_id, films.film_id))
      .where(
        and(
          eq(reviews.user_id, myId),
          sql`coalesce(trim(${reviews.comment}), '') <> ''`,
        ),
      )
      .orderBy(desc(reviews.created_at))
      .limit(5);

    res.json(
      rows.map((row) => ({
        reviewId: row.reviewId,
        filmId: row.filmId,
        omdbId: row.omdbId,
        filmTitle: row.filmTitle,
        posterUrl: row.posterUrl,
        comment: row.comment ?? "",
        isReply: row.parentReviewId !== null,
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /api/users?search= — rechercher des utilisateurs avec statut de relation
router.get("/", async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(String(req.session!.user.id));
    const search = ((req.query.search as string) ?? "").trim();

    if (search.length < 2) {
      res.json([]);
      return;
    }

    const results = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(user)
      .where(
        or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)),
      )
      .limit(20);

    const others = results.filter((u) => u.id !== myId);
    if (others.length === 0) {
      res.json([]);
      return;
    }

    // Récupère les relations existantes avec ces utilisateurs
    const otherIds = others.map((u) => u.id);
    const relations = await db
      .select({
        user_id: friends.user_id,
        friend_user_id: friends.friend_user_id,
        status: friends.status,
      })
      .from(friends)
      .where(
        and(
          or(eq(friends.user_id, myId), eq(friends.friend_user_id, myId)),
          or(
            inArray(friends.user_id, otherIds),
            inArray(friends.friend_user_id, otherIds),
          ),
        ),
      );

    // Mappe otherId → statut de relation
    const statusMap = new Map<number, string>();
    for (const rel of relations) {
      const otherId = rel.user_id === myId ? rel.friend_user_id : rel.user_id;
      statusMap.set(otherId, rel.status ?? "pending");
    }

    res.json(
      others.map((u) => ({
        ...u,
        relationStatus: statusMap.get(u.id) ?? null,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
