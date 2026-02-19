import http from 'http';
import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { initSocket } from './socket.js';
import friendsRouter from './routes/friends.js';
import messagesRouter from './routes/messages.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: [frontendOrigin, 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

const authHandler = toNodeHandler(auth);

function wrapAuthHandler(
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  authHandler(req, res).catch((err: unknown) => {
    console.error('[Better Auth] Handler error:', err);
    const message = err instanceof Error ? err.message : String(err);
    if (!res.headersSent) res.status(500).json({ error: 'Auth error', detail: message });
  });
}

// Better Auth doit être monté AVANT express.json()
app.all('/api/auth', wrapAuthHandler);
app.all('/api/auth/{*any}', wrapAuthHandler);

app.use(express.json());

// Routes API
app.get('/', (_req, res) => {
  res.json({ message: 'CineConnect API is running!' });
});

app.use('/api/friends', friendsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// Serveur HTTP + Socket.io
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
