import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env 
dotenv.config();

// Utiliser les variables
export default {
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME!,
  },
} satisfies Config;


//...(process.env.DB_PASSWORD && { password: process.env.DB_PASSWORD }),