// Shared Postgres pool for runtime API routes (auth/org/figures/members —
// the public schema only; dashboard chart data is static, see data/*.js).
// Prefers DATABASE_URL (e.g. Supabase's connection string, needs SSL) —
// falls back to the discrete DB_HOST/PORT/NAME/USER/PASSWORD vars used by
// local dev against a plain Postgres install (see .env.example).
import { Pool } from "pg";

let pool;

export function getPool() {
  if (!pool) {
    pool = process.env.DATABASE_URL
      ? new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        })
      : new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 5432),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        });
  }
  return pool;
}
