import http from 'http';
import cors from 'cors';
import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import friendsRouter from './routes/friends.js';
import messagesRouter from './routes/messages.js';
import usersRouter from './routes/users.js';
import filmsRouter from './routes/films.js';
import { initSocket } from './socket.js';

export function createApp(): express.Express {
  const app = express();
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
      if (!res.headersSent) {
        res.status(500).json({ error: 'Auth error', detail: message });
      }
    });
  }

  // Better Auth doit etre monte avant express.json().
  app.all('/api/auth', wrapAuthHandler);
  app.all('/api/auth/{*any}', wrapAuthHandler);

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({ message: 'CineConnect API is running!' });
  });

  app.use('/api/friends', friendsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/films', filmsRouter);

  return app;
}

export function createHttpServer(app: express.Express): http.Server {
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  return httpServer;
}
