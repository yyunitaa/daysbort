// Runs the SQL files in scripts/migrations/ against the local DB in order,
// skipping ones already applied (tracked in public.schema_migrations).
// Run with: npm run migrate
import { Client } from "pg";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env.local optional
  }
}

async function main() {
  await loadEnvLocal();

  const client = process.env.DATABASE_URL
    ? new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  const applied = new Set(
    (await client.query(`SELECT filename FROM public.schema_migrations`)).rows.map((r) => r.filename)
  );

  const dir = path.join(__dirname, "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    console.log(`Running ${file}...`);
    const sql = await readFile(path.join(dir, file), "utf8");
    await client.query(sql);
    await client.query(`INSERT INTO public.schema_migrations (filename) VALUES ($1)`, [file]);
  }

  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
