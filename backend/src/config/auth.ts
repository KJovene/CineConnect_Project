import * as dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

dotenv.config();

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret || secret.length < 32) {
  console.warn(
    "[Better Auth] BETTER_AUTH_SECRET manquant ou trop court (min 32 caractères). Générez avec: openssl rand -base64 32",
  );
}

/**
 * Instance Better Auth pour CineConnect.
 * Utilise Drizzle + PostgreSQL, email/password, IDs numériques (serial) pour user.
 */
export const auth = betterAuth({
  baseURL,
  secret: secret ?? "dev-secret-min-32-chars-change-in-prod",
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  advanced: {
    database: {
      generateId: "serial",
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    baseURL,
  ].filter(Boolean) as string[],
});
