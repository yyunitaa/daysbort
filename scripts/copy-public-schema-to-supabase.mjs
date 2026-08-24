// One-off: copy existing rows from local Postgres public.* tables (users,
// organizations, user_organizations, figures, figure_access) into Supabase,
// which already has the same tables (created by `npm run migrate`) but no
// data. Preserves IDs and fixes up sequences afterward. Run with:
//   node scripts/copy-public-schema-to-supabase.mjs
import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Insert order matters (FK dependencies).
const TABLES = ["organizations", "users", "user_organizations", "figures", "figure_access"];
const SERIAL_TABLES = ["organizations", "users", "figures"]; // have an `id` SERIAL column

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // optional
  }
}

async function main() {
  await loadEnvLocal();

  const source = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  const target = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await source.connect();
  await target.connect();

  for (const table of TABLES) {
    const fq = `public.${table}`;
    const dataResult = await source.query(`SELECT * FROM ${fq}`);
    const rows = dataResult.rows;
    if (rows.length === 0) {
      console.log(`${fq}: no rows, skipping.`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    const colNames = cols.map((c) => `"${c}"`).join(", ");
    const values = [];
    const placeholders = rows
      .map((row, ri) => {
        const rowPlaceholders = cols.map((c, ci) => {
          values.push(row[c]);
          return `$${ri * cols.length + ci + 1}`;
        });
        return `(${rowPlaceholders.join(", ")})`;
      })
      .join(", ");
    await target.query(`INSERT INTO ${fq} (${colNames}) VALUES ${placeholders} ON CONFLICT DO NOTHING`, values);
    console.log(`${fq}: copied ${rows.length} rows.`);
  }

  for (const table of SERIAL_TABLES) {
    await target.query(
      `SELECT setval(pg_get_serial_sequence('public.${table}', 'id'), COALESCE((SELECT MAX(id) FROM public.${table}), 1))`
    );
  }
  console.log("Sequences fixed up.");

  await source.end();
  await target.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
