import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[e-hotels-server] DATABASE_URL is not set. Set it in server/.env or the project root .env (e.g. postgresql://user:pass@localhost:5432/ehotels).'
  );
}

export const pool = new Pool({
  connectionString: connectionString ?? 'postgresql://localhost:5432/postgres'
});