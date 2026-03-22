import * as dotenv from "dotenv";
import { createApp, createHttpServer } from "./app.js";

dotenv.config();

export function startServer() {
  const app = createApp();
  const httpServer = createHttpServer(app);
  const PORT = process.env.PORT || 3000;

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  return { app, httpServer };
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}
