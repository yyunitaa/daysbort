-- Role sekarang ada 3: 'super_admin' (akses penuh semua figur, checklist
-- diabaikan — dipegang pembuat organisasi), 'admin' (bisa kelola figur/member,
-- tapi cuma bisa MASUK ke figur yang di-checklist-kan; figur lain tetap
-- kelihatan di daftar tapi abu-abu/tidak bisa diklik), 'member' (cuma lihat
-- figur yang di-checklist-kan, figur lain disembunyikan sepenuhnya).
ALTER TABLE public.user_organizations DROP CONSTRAINT IF EXISTS user_organizations_role_check;
ALTER TABLE public.user_organizations
  ADD CONSTRAINT user_organizations_role_check CHECK (role IN ('super_admin', 'admin', 'member'));

-- Backfill: sebelum role granular ini ada, satu-satunya cara jadi 'admin'
-- adalah membuat organisasinya sendiri (akses penuh tanpa checklist). Baris
-- paling awal per organisasi (pembuatnya) dinaikkan jadi 'super_admin'.
WITH earliest AS (
  SELECT DISTINCT ON (organization_id) user_id, organization_id
  FROM public.user_organizations
  ORDER BY organization_id, created_at ASC
)
UPDATE public.user_organizations uo
SET role = 'super_admin'
FROM earliest e
WHERE uo.user_id = e.user_id AND uo.organization_id = e.organization_id AND uo.role = 'admin';
