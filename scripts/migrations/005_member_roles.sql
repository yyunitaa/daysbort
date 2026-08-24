-- Role per (akun, organisasi): 'admin' bisa semuanya, 'member' view only.
-- Akun yang sudah tergabung SEBELUM migrasi ini (pembuat organisasi) otomatis
-- jadi admin — backfill di bawah.
ALTER TABLE public.user_organizations ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
UPDATE public.user_organizations SET role = 'admin';
ALTER TABLE public.user_organizations
  ADD CONSTRAINT user_organizations_role_check CHECK (role IN ('admin', 'member'));

-- Figur mana saja dalam organisasi yang bisa diakses seorang member. Hanya
-- ditegakkan untuk role='member' — admin selalu bisa akses semua figur di
-- organisasinya (lihat lib/current-user.js / app/organization/figures).
CREATE TABLE IF NOT EXISTS public.figure_access (
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  figure_id INTEGER NOT NULL REFERENCES public.figures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, figure_id)
);
