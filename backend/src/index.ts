import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

// CORS : credentials pour cookies Better Auth (frontend sur origine différente)
app.use(
  cors({
    origin: [frontendOrigin, "http://127.0.0.1:5173"],
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
    console.error("[Better Auth] Handler error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const cause = err instanceof Error && err.cause ? String(err.cause) : "";
    if (cause) console.error("[Better Auth] Cause:", cause);
    if (!res.headersSent) res.status(500).json({ error: "Auth error", detail: message });
  });
}

// Better Auth : doit être monté AVANT express.json() (Better Auth parse le body lui-même)
// Express 5 : route exacte + catch-all pour /api/auth et sous-chemins
app.all("/api/auth", wrapAuthHandler);
app.all("/api/auth/{*any}", wrapAuthHandler);

app.use(express.json());

// Routes
app.get("/", (_req, res) => {
  res.json({ message: "CineConnect API is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});