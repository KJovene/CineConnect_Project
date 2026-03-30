import * as dotenv from "dotenv";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { sendMail } from "../services/mailer/mailerService.js";
import {
  welcomeTemplate,
  verifyEmailTemplate,
  resetPasswordTemplate,
  loginAlertTemplate,
} from "../utils/emailTemplates/index.js";

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
    sendVerificationEmail: async ({ user, url }: { user: { name: string | null; email: string }; url: string }) => {
      const { subject, html } = verifyEmailTemplate(user.name || user.email, url);
      await sendMail({ to: user.email, subject, html });
    },
    sendResetPassword: async ({ user, url }: { user: { name: string | null; email: string }; url: string }) => {
      const { subject, html } = resetPasswordTemplate(user.name || user.email, url);
      await sendMail({ to: user.email, subject, html });
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { subject, html } = welcomeTemplate(user.name || user.email);
          await sendMail({ to: user.email, subject, html });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const uid = Number(session.userId);
          const [foundUser] = await db
            .select({ name: schema.user.name, email: schema.user.email })
            .from(schema.user)
            .where(eq(schema.user.id, uid));
          if (!foundUser) return;
          const s = session as typeof session & {
            ipAddress?: string | null;
            userAgent?: string | null;
            createdAt?: Date;
          };
          const { subject, html } = loginAlertTemplate(
            foundUser.name || foundUser.email,
            s.ipAddress ?? null,
            s.userAgent ?? null,
            s.createdAt ?? new Date(),
          );
          await sendMail({ to: foundUser.email, subject, html });
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  trustedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    baseURL,
  ].filter(Boolean) as string[],
});
