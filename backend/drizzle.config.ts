import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: false });
dotenv.config({ path: path.resolve(__dirname, ".env"), override: false });

const resolveDatabaseUrl = (): string => {
  const preferredUrl =
    process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!preferredUrl) {
    throw new Error(
      "Missing DRIZZLE_DATABASE_URL or DATABASE_URL in environment variables.",
    );
  }

  const isInsideDocker = fs.existsSync("/.dockerenv");

  if (!isInsideDocker) {
    const parsed = new URL(preferredUrl);
    if (parsed.hostname === "postgres") {
      parsed.hostname = "127.0.0.1";
      return parsed.toString();
    }
  }

  return preferredUrl;
};

// Configuration Drizzle pour PostgreSQL
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
} satisfies Config;
