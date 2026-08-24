// One-off: replicate the l1_silver/l2_gold warehouse (schema + data) from
// the local Postgres DB into Supabase (DATABASE_URL), so the dashboard can
// be converted to live queries. Run with:
//   node scripts/migrate-warehouse-to-supabase.mjs
// Requires DB_HOST/... (source, local) AND DATABASE_URL (target, Supabase)
// both set in .env.local.
import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMAS = ["l1_silver", "l2_gold"];
const BATCH_SIZE = 500;

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

function pgType(col) {
  if (col.data_type === "USER-DEFINED") return col.udt_name;
  if (col.data_type === "character varying") {
    return col.character_maximum_length ? `varchar(${col.character_maximum_length})` : "varchar";
  }
  if (col.data_type === "ARRAY") return `${col.udt_name.replace(/^_/, "")}[]`;
  return col.data_type;
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

  for (const schema of SCHEMAS) {
    await target.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
  }

  const tablesResult = await source.query(
    `SELECT table_schema, table_name FROM information_schema.tables
     WHERE table_schema = ANY($1) ORDER BY table_schema, table_name`,
    [SCHEMAS]
  );

  for (const { table_schema: schema, table_name: table } of tablesResult.rows) {
    const fq = `${schema}.${table}`;
    console.log(`\n== ${fq} ==`);

    const colsResult = await source.query(
      `SELECT column_name, data_type, udt_name, character_maximum_length, is_nullable
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schema, table]
    );
    const cols = colsResult.rows;

    const colDefs = cols
      .map((c) => `"${c.column_name}" ${pgType(c)}${c.is_nullable === "NO" ? " NOT NULL" : ""}`)
      .join(", ");
    await target.query(`DROP TABLE IF EXISTS ${fq} CASCADE`);
    await target.query(`CREATE TABLE ${fq} (${colDefs})`);
    console.log(`  created (${cols.length} cols)`);

    const colNames = cols.map((c) => `"${c.column_name}"`).join(", ");
    const dataResult = await source.query(`SELECT * FROM ${fq}`);
    const rows = dataResult.rows;
    console.log(`  copying ${rows.length} rows...`);

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const values = [];
      const placeholders = batch
        .map((row, ri) => {
          const rowPlaceholders = cols.map((c, ci) => {
            values.push(row[c.column_name]);
            return `$${ri * cols.length + ci + 1}`;
          });
          return `(${rowPlaceholders.join(", ")})`;
        })
        .join(", ");
      await target.query(`INSERT INTO ${fq} (${colNames}) VALUES ${placeholders}`, values);
    }
    console.log(`  done.`);
  }

  await source.end();
  await target.end();
  console.log("\nAll done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
