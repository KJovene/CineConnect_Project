import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { auth } from "./auth.js";
import * as messagesService from "./services/messagesService.js";

interface SocketData {
  userId: number;
  userName: string | null;
}

export function initSocket(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
    },
  });

  // Middleware d'authentification via session Better Auth (cookie)
  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie ?? "";
      const headers = new Headers({ cookie });
      const sessionData = await auth.api.getSession({ headers });

      if (!sessionData?.user) {
        return next(new Error("Non authentifié"));
      }

      socket.data.userId = parseInt(sessionData.user.id);
      socket.data.userName = sessionData.user.name ?? null;
      next();
    } catch {
      next(new Error("Erreur d'authentification"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as SocketData).userId;

    // Chaque utilisateur rejoint sa propre room pour recevoir des messages
    socket.join(`user:${userId}`);

    // Envoi d'un DM
    socket.on(
      "dm:send",
      async (payload: { toUserId: number; content: string }) => {
        const { toUserId, content } = payload;

        if (!toUserId || !content?.trim()) return;

        try {
          const message = await messagesService.createMessage(
            userId,
            toUserId,
            content.trim(),
          );

          // Envoyer au destinataire
          io.to(`user:${toUserId}`).emit("dm:new", { message });

          // Renvoyer à l'émetteur (confirmation + multi-onglet)
          socket.emit("dm:new", { message });
        } catch (err) {
          socket.emit("dm:error", { error: "Impossible d'envoyer le message" });
        }
      },
    );

    // Marquer comme lu (optionnel)
    socket.on("dm:seen", (payload: { fromUserId: number }) => {
      io.to(`user:${payload.fromUserId}`).emit("dm:seen", { byUserId: userId });
    });

    socket.on("disconnect", () => {
      io.emit("presence:offline", { userId });
    });

    // Notifier les autres de la présence en ligne
    io.emit("presence:online", { userId });
  });

  return io;
}
