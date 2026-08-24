-- Tabel akun untuk halaman login/register. Disimpan di skema public
-- (default), berbeda dari data mention di l1_silver/l2_gold.
-- Jalankan manual: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f scripts/migrations/001_create_users.sql

CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
