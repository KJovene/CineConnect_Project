import express from 'express';
import request from 'supertest';

const mockMessagesService = {
  getConversation: jest.fn(),
  getRecentConversations: jest.fn(),
  getIncomingMessages: jest.fn(),
  createMessage: jest.fn(),
};

jest.mock('../services/messagesService.js', () => mockMessagesService);

jest.mock('../middlewares/authMiddleware.js', () => ({
  attachSession: (req: any, _res: any, next: any) => {
    req.session = { user: { id: '1' } };
    next();
  },
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

import messagesRouter from '../routes/messages.js';

describe('messages routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/messages', messagesRouter);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /with/:userId retourne conversation', async () => {
    mockMessagesService.getConversation.mockResolvedValue([{ message_id: 1 }]);

    const res = await request(app).get('/api/messages/with/2?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ message_id: 1 }]);
  });

  it('GET /with/:userId retourne 500 en erreur', async () => {
    mockMessagesService.getConversation.mockRejectedValue(new Error('x'));

    const res = await request(app).get('/api/messages/with/2');

    expect(res.status).toBe(500);
  });

  it('GET /conversations retourne liste', async () => {
    mockMessagesService.getRecentConversations.mockResolvedValue([{ message_id: 1 }]);

    const res = await request(app).get('/api/messages/conversations');

    expect(res.status).toBe(200);
  });

  it('GET /conversations retourne 500 en erreur', async () => {
    mockMessagesService.getRecentConversations.mockRejectedValue(new Error('x'));

    const res = await request(app).get('/api/messages/conversations');

    expect(res.status).toBe(500);
  });

  it('GET /incoming retourne notifications', async () => {
    mockMessagesService.getIncomingMessages.mockResolvedValue([{ message_id: 1 }]);

    const res = await request(app).get('/api/messages/incoming?limit=10');

    expect(res.status).toBe(200);
  });

  it('GET /incoming retourne 500 en erreur', async () => {
    mockMessagesService.getIncomingMessages.mockRejectedValue(new Error('x'));

    const res = await request(app).get('/api/messages/incoming');

    expect(res.status).toBe(500);
  });

  it('POST / retourne 400 si payload incomplet', async () => {
    const res = await request(app).post('/api/messages').send({});

    expect(res.status).toBe(400);
  });

  it('POST / retourne 201 si ok', async () => {
    mockMessagesService.createMessage.mockResolvedValue({ message_id: 1 });

    const res = await request(app)
      .post('/api/messages')
      .send({ receiverId: 2, content: ' hello ' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message_id: 1 });
  });

  it('POST / retourne 500 en erreur', async () => {
    mockMessagesService.createMessage.mockRejectedValue(new Error('x'));

    const res = await request(app)
      .post('/api/messages')
      .send({ receiverId: 2, content: 'hello' });

    expect(res.status).toBe(500);
  });
});
