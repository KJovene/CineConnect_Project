import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la connexion PostgreSQL
const poolConnection = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exporter l'instance Drizzle pour PostgreSQL
export const db = drizzle(poolConnection, { schema });