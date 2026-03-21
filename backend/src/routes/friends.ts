import { Router } from 'express';
import { attachSession, requireAuth, type RequestWithSession } from '../middlewares/authMiddleware.js';
import * as friendsService from '../services/friendsService.js';

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/friends — liste des amis acceptés
router.get('/', async (req: RequestWithSession, res) => {
  try {
    const userId = parseInt(req.session!.user.id);
    const data = await friendsService.getFriends(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/friends/pending — demandes reçues en attente
router.get('/pending', async (req: RequestWithSession, res) => {
  try {
    const userId = parseInt(req.session!.user.id);
    const data = await friendsService.getPendingRequests(userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/friends/request — envoyer une demande
router.post('/request', async (req: RequestWithSession, res) => {
  const rawId = req.session!.user.id;
  const userId = parseInt(String(rawId));
  const { friendUserId } = req.body as { friendUserId: unknown };

  if (isNaN(userId)) {
    res.status(400).json({ error: `ID de session invalide : ${rawId}` });
    return;
  }

  const friendId = typeof friendUserId === 'number'
    ? friendUserId
    : parseInt(String(friendUserId));

  if (!friendId || isNaN(friendId)) {
    res.status(400).json({ error: 'friendUserId invalide ou manquant' });
    return;
  }

  try {
    const result = await friendsService.sendFriendRequest(userId, friendId);
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    res.status(400).json({ error: message });
  }
});

// POST /api/friends/accept — accepter une demande
router.post('/accept', async (req: RequestWithSession, res) => {
  try {
    const userId = parseInt(req.session!.user.id);
    const { friendUserId } = req.body as { friendUserId: number };
    if (!friendUserId) {
      res.status(400).json({ error: 'friendUserId requis' });
      return;
    }
    const result = await friendsService.acceptFriendRequest(userId, friendUserId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    res.status(400).json({ error: message });
  }
});

// POST /api/friends/reject — rejeter une demande
router.post('/reject', async (req: RequestWithSession, res) => {
  try {
    const userId = parseInt(req.session!.user.id);
    const { friendUserId } = req.body as { friendUserId: number };
    if (!friendUserId) {
      res.status(400).json({ error: 'friendUserId requis' });
      return;
    }
    const result = await friendsService.rejectFriendRequest(userId, friendUserId);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    res.status(400).json({ error: message });
  }
});

// DELETE /api/friends/:friendUserId — supprimer un ami
router.delete('/:friendUserId', async (req: RequestWithSession, res) => {
  try {
    const userId = parseInt(req.session!.user.id);
    const friendUserId = parseInt(String(req.params.friendUserId));
    await friendsService.removeFriend(userId, friendUserId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
