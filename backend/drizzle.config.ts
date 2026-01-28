import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env 
dotenv.config();

// Configuration Drizzle pour PostgreSQL
export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;