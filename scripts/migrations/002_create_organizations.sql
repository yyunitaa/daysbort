-- Organisasi & figur. Skema public, sama seperti public.users.
-- Satu akun (public.users) tergabung di paling banyak satu organisasi.
-- Satu organisasi bisa punya banyak akun dan banyak figur.
CREATE TABLE IF NOT EXISTS public.organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES public.organizations(id);

-- subject_id, kalau diisi, menghubungkan figur ke data nyata di
-- l1_silver.mention (mis. 'AJD'). Kalau NULL/tidak match, dashboard
-- figur itu menampilkan data contoh dengan disclaimer eksplisit —
-- lihat app/dashboard/[figureId]/page.js.
CREATE TABLE IF NOT EXISTS public.figures (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  subject_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
