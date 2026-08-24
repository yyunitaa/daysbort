-- Satu akun sekarang bisa tergabung di banyak organisasi (many-to-many),
-- bukan cuma satu. public.users.organization_id dipertahankan sebagai
-- "organisasi aktif" (yang sedang ditampilkan di sidebar/dashboard);
-- public.user_organizations menyimpan semua organisasi yang diikuti akun.
CREATE TABLE IF NOT EXISTS public.user_organizations (
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id)
);

-- Migrasikan keanggotaan yang sudah ada (users.organization_id) ke tabel baru.
INSERT INTO public.user_organizations (user_id, organization_id)
SELECT id, organization_id FROM public.users WHERE organization_id IS NOT NULL
ON CONFLICT DO NOTHING;
