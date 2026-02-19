import { Router } from 'express';
import { attachSession, requireAuth, type RequestWithSession } from '../middlewares/authMiddleware.js';
import * as messagesService from '../services/messagesService.js';

const router = Router();

router.use(attachSession, requireAuth);

// GET /api/messages/with/:userId — historique d'une conversation
router.get('/with/:userId', async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(req.session!.user.id);
    const otherId = parseInt(req.params.userId);
    const page = parseInt((req.query.page as string) ?? '1');
    const limit = parseInt((req.query.limit as string) ?? '50');

    const data = await messagesService.getConversation(myId, otherId, page, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/messages/conversations — liste des dernières conversations
router.get('/conversations', async (req: RequestWithSession, res) => {
  try {
    const myId = parseInt(req.session!.user.id);
    const data = await messagesService.getRecentConversations(myId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/messages — envoyer un message (fallback sans socket)
router.post('/', async (req: RequestWithSession, res) => {
  try {
    const senderId = parseInt(req.session!.user.id);
    const { receiverId, content } = req.body as { receiverId: number; content: string };

    if (!receiverId || !content?.trim()) {
      res.status(400).json({ error: 'receiverId et content requis' });
      return;
    }

    const message = await messagesService.createMessage(senderId, receiverId, content.trim());
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
