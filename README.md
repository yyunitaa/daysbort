# Kanalytics

Dashboard "Audience Intelligence" multi-figur/multi-organisasi, dibangun
dengan Next.js (App Router) + Recharts. Sejak dipindah ke Supabase, **semua
data — termasuk chart dashboard — di-query live** dari warehouse
`l1_silver.mention` / `l2_gold.*` (lihat `lib/live-data.js`), bukan lagi baca
file snapshot statis. `data/*-snapshot.js` masih ada di repo sebagai arsip/
riwayat cara lama, tapi sudah tidak dipakai kode manapun (kecuali
`data/audience-followers-<subject>-snapshot.js`, lihat catatan di bawah).

Ada 3 menu/tab:

- **Self Perception** — persepsi publik terhadap AJD sendiri (sentimen,
  topik, radar risiko, konten teratas). `components/tabs/SelfPerceptionTab.jsx`
  + `data/ajd-snapshot.js`.
- **My Regency** — persepsi publik terhadap Kabupaten Kolaka sebagai daerah
  yang dipimpinnya (sentimen, isu daerah seperti sengketa lahan tambang,
  radar risiko). `components/tabs/RegencyTab.jsx` + `data/klk-snapshot.js`.
- **Audience** — basis pendukung & kandidat komunitas: segmen audiens,
  aktivitas platform, emosi komentar, dan daftar akun publik yang
  menunjukkan dukungan eksplisit terhadap AJD.
  `components/tabs/AudienceTab.jsx` + `data/audience-snapshot.js`.

**Catatan soal tab Audience:** database sumber tidak punya field usia,
gender, atau kota domisili audiens yang valid — TikTok tidak mengekspos field
itu ke pihak ketiga manapun, termasuk lewat 5.000 follower nyata yang sudah
ditarik (lihat di bawah). Tab ini memakai sinyal yang memang tersedia
(platform, segmen, emosi, follower tier, dukungan eksplisit, kata kunci
lokasi di bio) sebagai proxy/starting point komunitas, bukan data demografis
asli. Ini dijelaskan langsung di dalam UI tab tersebut.

## Menarik follower nyata (opsional, berbayar)

`data/audience-followers-<subject>-snapshot.js` (satu file per subject —
mis. `-ajd-`, `-bhl-`, `-arr-`, `-mar-`) diisi dari follower nyata hasil
scrape Apify, dipetakan ke tiap subject di
`components/tabs/AudienceTab.jsx` (`FOLLOWERS_DATA_BY_SUBJECT`). Subject yang
belum pernah di-scrape dapat versi kosong (`data/empty/audience-followers-snapshot.js`).

Dua jalur scrape tergantung platform mana yang handle-nya sudah terverifikasi
di `config/entities.yaml` (proyek `kanalytics-spi`) — **jangan menebak
handle**, salah akun berarti data follower orang lain disajikan seolah-olah
pendukung figur yang salah.

**TikTok** (`clockworks/tiktok-followers-scraper`, ~$1/1.000 follower — satu
actor, field `fans`/`signature` per follower sudah lengkap):

```bash
node scripts/pull-followers.mjs --subject AJD --handle amrijamaluddin_ --max 5000 --yes
```

**Instagram** (dua actor berantai, karena API follower-list Instagram TIDAK
mengekspos follower-count/bio tiap follower seperti TikTok — perlu tahap
enrichment terpisah):
1. `scraping_solutions/instagram-scraper-followers-following-no-cookies`
   (~$0.60/1.000) — daftar username follower.
2. `apify/instagram-profile-scraper` (~$1.60/1.000) — enrich tiap username
   jadi `followersCount` + `biography`.

```bash
node scripts/pull-followers-instagram.mjs --subject ARR --handle ahmadrizal.ramdhani --max 1000 --yes
```

Logic bersama (tier follower, sinyal lokasi dari bio, ranking paling
berpengaruh, penulisan file snapshot) ada di `scripts/lib/follower-analysis.mjs`,
dipakai kedua script supaya bentuk file output identik apa pun platformnya.

**PERINGATAN: kedua script mengenakan biaya nyata ke akun Apify kamu.**
Keduanya menolak jalan tanpa flag `--yes`, dan **tidak** pernah dipanggil
otomatis oleh `npm run refresh-data`. Butuh `APIFY_TOKEN` di `.env.local`.

### Estimasi usia, gender, kota (atas permintaan eksplisit)

TikTok/Instagram tidak pernah membuka field usia/gender/kota per-follower ke
pihak ketiga. Atas permintaan eksplisit, tiap
`data/audience-followers-<subject>-snapshot.js` berisi **estimasi
statistik** (bukan pengukuran) untuk ketiganya, dihitung otomatis oleh kedua
script pull di atas lewat `scripts/lib/demographics.mjs` (kamus nama +
keyword kota, lihat komentar di file itu untuk metodologi lengkap):

- **Gender** — nama depan (nickName/name) dicocokkan ke kamus nama Indonesia;
  biasanya cuma sebagian kecil follower yang bisa diklasifikasi langsung
  (bervariasi per subject, ~3-16% pada 4 subject yang sudah ditarik), sisanya
  diimputasi proporsional dari rasio itu.
- **Kota** — keyword wilayah di bio; coverage rendah (~1-13%), sisanya
  diimputasi proporsional dari distribusi kota yang teridentifikasi.
- **Usia** — **tidak ada sinyal sama sekali** di data manapun; angkanya cuma
  asumsi pola umum pengguna TikTok/Instagram Indonesia, SAMA persentasenya
  untuk semua subject (bukan hasil analisis per-follower).

Semua ini diberi label "estimasi" secara eksplisit di UI (tab Audience,
section "Estimasi Usia, Gender & Kota") dan di komentar
`scripts/lib/demographics.mjs` — jangan disajikan ke pihak eksternal sebagai
fakta terukur tanpa disclosure itu.

## Menjalankan secara lokal

Butuh Node.js 18+ terpasang.

```bash
npm install
npm run migrate   # sekali saja, bikin tabel public.users
npm run dev
```

Buka http://localhost:3000 — halaman landing platform Kanalytics
(`app/page.js`). Buat akun lewat `/register` (username + email + password,
minimal 8 karakter — email harus unik, username boleh sama dengan akun lain),
lalu masuk lewat `/login` pakai **email** + password.

## Login, organisasi & figur

Alurnya: **register → login → `/welcome`** (tagline + tombol "Eksplor") →
kalau akun belum tergabung organisasi, diarahkan buat organisasi baru
(`/organization/new`) → daftar figur milik organisasi itu
(`/organization/figures`, bisa tambah figur baru di situ) → pilih figur →
dashboard (`/dashboard/[figureId]`).

Model datanya (skema `public`, terpisah dari data mention di
`l1_silver`/`l2_gold`) — lihat `scripts/migrations/00{1,2}_*.sql`:

- `public.users` — satu akun, opsional `organization_id` (satu akun paling
  banyak gabung satu organisasi).
- `public.organizations` — satu organisasi bisa punya banyak akun & banyak figur.
- `public.figures` — milik satu organisasi, punya `name`/`title`, dan
  `subject_id` opsional yang menghubungkan ke data nyata di `l1_silver.mention`
  (saat ini cuma `'AJD'` yang beneran ada datanya). Field `subject_id` ini
  **tidak** ada di form tambah figur — hanya bisa diisi manual lewat DB kalau
  memang mau menyambungkan figur ke data nyata.
- `public.user_organizations.role` — 3 role per (akun, organisasi):
  `super_admin` (pembuat organisasi — akses penuh ke semua figur, checklist
  diabaikan), `admin` (bisa kelola figur & member, lihat semua figur di daftar
  tapi cuma bisa **masuk** ke figur yang di-checklist-kan — figur lain tetap
  kelihatan tapi abu-abu/tidak bisa diklik), `member` (view only, cuma lihat
  figur yang di-checklist-kan — figur lain disembunyikan sepenuhnya). Role
  `super_admin` tidak bisa diberikan lewat form Tambah Member (cuma admin/
  member) dan tidak bisa diubah/dihapus lewat halaman `/member`.
- `public.figure_access` — checklist figur per akun, diisi lewat halaman
  `/member` (cari akun berdasarkan email → pilih role → checklist figur).
  Ditegakkan di `lib/figure-access.js`.
- Figur yang `subject_id`-nya kosong/tidak match tetap bisa masuk dashboard —
  menu dan semua chart tetap ada, tapi **kosong** (bukan menampilkan data AJD
  sebagai contoh), plus **disclaimer eksplisit** di atas kalau data figur ini
  belum tersedia. Lihat `components/DashboardShell.jsx` dan
  `data/empty/*-snapshot.js` (bentuk data kosong, struktur sama persis dengan
  `data/*-snapshot.js` asli supaya tab tidak perlu logic terpisah).

`/welcome`, `/organization/*`, dan `/dashboard/*` dilindungi login
(`middleware.js`) — landing page di `/` tetap publik. Password di-hash dengan
bcrypt, session disimpan sebagai cookie ber-signature HMAC (`lib/auth.js`,
butuh `SESSION_SECRET` di `.env.local`, lihat `.env.example`).

Report figur-spesifik (`/dashboard/[figureId]/report`) — `middleware.js` juga
menyimpan `figureId` terakhir yang dikunjungi ke cookie `current_figure_id`,
supaya menu sidebar (Report, submenu Dashboard) yang diklik dari halaman lain
(Member/Setting/Organisasi) tetap kembali ke figur yang sama, bukan ke
pemilih figur. Lihat `lib/current-figure.js`.

**Catatan:** login/organisasi/figur/member butuh koneksi DB langsung ke skema
`public` — tapi ini DB YANG BEDA dari `kanalytics_spi_test` (warehouse
`l1_silver`/`l2_gold`). Dashboard tidak pernah query warehouse itu saat
runtime (chart-nya baca `data/*.js` statis), jadi DB untuk login **tidak**
perlu berisi warehouse sama sekali — cukup tabel dari `npm run migrate`
(lihat "Deploy ke Vercel" di bawah untuk pakai Supabase).

## Data live (lib/live-data.js)

Chart dashboard (KPI, tren, topik, radar risiko, audiens) di-query langsung
dari `l1_silver.mention` / `l2_gold.*` lewat `getSelfPerceptionData`,
`getAudienceData`, dan `getRiskRadarList` di `lib/live-data.js` — dipanggil
dari `app/dashboard/[figureId]/page.js` (Server Component) berdasarkan
`figure.subject_id`, hasilnya diteruskan sebagai props ke tab-tab client.
Subject_id yang tidak match apapun (atau `null`) otomatis dapat hasil
kosong/nol dari query-nya sendiri — tidak perlu file "empty" terpisah lagi.

Query-nya generik (pakai `l2_gold.agg_opportunity_generic` /
`agg_risk_radar_generic`, bukan tabel per-subject seperti `_ajd`/`_klk` yang
lama), jadi otomatis jalan untuk subject_id manapun yang ada datanya di
warehouse (`AJD`, `ARR`, `KLK`, `BHL`, `KLT`, `KLU`, `KNU`, dst — cek
`SELECT DISTINCT subject_id FROM l1_silver.mention`).

**Pengecualian:** `data/audience-followers-snapshot.js` (demografi 5.000
follower TikTok nyata `@amrijamaluddin_`, hasil scrape Apify) **tetap file
statis** — itu bukan bagian dari warehouse `l1_silver`/`l2_gold`, jadi tidak
ikut ter-live-query. Hanya berlaku untuk AJD; subject lain selalu dapat versi
kosong di bagian "Data Pengikut TikTok" (lihat `components/tabs/AudienceTab.jsx`).

`scripts/export-data.mjs` dan `scripts/export-generic-subject.mjs` (skrip
lama yang menulis `data/*-snapshot.js`) masih ada tapi **sudah tidak dipakai**
oleh dashboard — dipertahankan sebagai referensi query kalau suatu saat perlu
generate snapshot statis lagi (mis. untuk demo offline).

## Database: Supabase (public schema + warehouse)

Semuanya — sistem login/organisasi/figur/member (skema `public`) DAN
warehouse (`l1_silver`/`l2_gold`) — ada di satu project Supabase yang sama.
`lib/db.js` dan `scripts/migrate.mjs` pakai `DATABASE_URL` kalau di-set di
`.env.local` (prioritas di atas `DB_HOST` dkk, yang cuma fallback untuk
Postgres lokal biasa).

Kalau perlu setup ulang dari nol atau ke project Supabase lain:

1. **Buat project Supabase** di [supabase.com](https://supabase.com), ambil
   connection string dari **Project Settings → Database → Connection
   string** (URI). Pakai mode **Session/Transaction pooler** (port 6543)
   untuk koneksi dari Vercel (serverless).
2. Set `DATABASE_URL` di `.env.local` ke connection string itu.
3. `npm run migrate` — bikin skema `public` (users, organizations, figures,
   dst).
4. Kalau warehouse-nya juga masih di Postgres lokal dan perlu dipindah:
   `node scripts/migrate-warehouse-to-supabase.mjs` (copy schema+data
   `l1_silver`/`l2_gold` apa adanya, replace kalau sudah ada) dan/atau
   `node scripts/copy-public-schema-to-supabase.mjs` (copy akun/organisasi/
   figur yang sudah ada, skip kalau row-nya sudah ada — keduanya script
   one-off, baca komentar di masing-masing file sebelum re-run).

## Deploy ke Vercel

1. Push project ini ke sebuah repo Git (GitHub/GitLab/Bitbucket).
2. Import repo tersebut di [vercel.com/new](https://vercel.com/new) — Vercel
   otomatis mendeteksi Next.js.
3. Di pengaturan project Vercel → **Environment Variables**, tambahkan:
   - `DATABASE_URL` — connection string Supabase yang sama seperti di atas.
   - `SESSION_SECRET` — generate baru (jangan pakai yang sama dengan lokal):
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Deploy. Landing page (`/`), login, organisasi/figur/member, dan seluruh
   chart dashboard sekarang sama-sama jalan lewat Supabase yang sama.

## Catatan tentang data

- Entitas AJD memerlukan disambiguasi nama (nama umum "Amri"/"Jamaluddin").
  Dari ~4.190 mention mentah yang match keyword, hanya ~157 yang lolos
  klasifikasi `attribution_layer` (institutional/attributed/direct) sebagai
  benar-benar relevan dengan Bupati Kolaka — sisanya kemungkinan besar noise
  nama kembar. Dashboard ini memisahkan angka "relevan" vs "volume kotor"
  secara eksplisit di tiap chart.
- Kalau nanti mau live query ke warehouse (`l1_silver`/`l2_gold`) juga
  (bukan cuma snapshot statis), itu perlu dipindah ke host publik terpisah
  (bisa juga Supabase, tapi database/project yang beda dari yang di atas) —
  strukturnya sudah ada di `scripts/export-data.mjs` dan
  `scripts/export-generic-subject.mjs`, tinggal dipindah jadi Next.js API
  route yang pakai `pg`.
