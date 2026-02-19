import { Router } from 'express';
import { attachSession, requireAuth, type RequestWithSession } from '../middlewares/authMiddleware.js';
import { db } from '../db/index.js';
import { user, friends } from '../db/schema.js';
import { ilike, or, and, eq, inArray } from 'drizzle-orm';

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/users?search= — rechercher des utilisateurs avec statut de relation
router.get('/', async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(String(req.session!.user.id));
    const search = (req.query.search as string ?? '').trim();

    if (search.length < 2) {
      res.json([]);
      return;
    }

    const results = await db
      .select({ id: user.id, name: user.name, email: user.email, image: user.image })
      .from(user)
      .where(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)))
      .limit(20);

    const others = results.filter((u) => u.id !== myId);
    if (others.length === 0) { res.json([]); return; }

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
            inArray(friends.friend_user_id, otherIds)
          )
        )
      );

    // Mappe otherId → statut de relation
    const statusMap = new Map<number, string>();
    for (const rel of relations) {
      const otherId = rel.user_id === myId ? rel.friend_user_id : rel.user_id;
      statusMap.set(otherId, rel.status ?? 'pending');
    }

    res.json(
      others.map((u) => ({
        ...u,
        relationStatus: statusMap.get(u.id) ?? null,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
