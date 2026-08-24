-- Akun sekarang punya email (unik, dipakai untuk login) terpisah dari
-- username (boleh sama dengan akun lain, cuma dipakai untuk ditampilkan).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill akun lama: kalau username-nya sudah berbentuk email, pakai itu;
-- kalau bukan, kasih placeholder supaya tetap bisa lolos NOT NULL/UNIQUE.
UPDATE public.users SET email = username WHERE email IS NULL AND username LIKE '%@%';
UPDATE public.users SET email = username || '+' || id || '@example.invalid' WHERE email IS NULL;

ALTER TABLE public.users ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
