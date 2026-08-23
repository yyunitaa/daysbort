# Kanalytics AJD Dashboard

Dashboard "Audience Intelligence" untuk Amri Jamaluddin (AJD), Bupati
Kabupaten Kolaka, dibangun dengan Next.js (App Router) + Recharts. Data
ditampilkan sebagai **snapshot statis** dari database `kanalytics_spi_test`
(lihat `data/*-snapshot.js`) — bukan live query — supaya bisa langsung
di-deploy ke Vercel tanpa perlu meng-expose database ke internet.

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

## Menarik follower TikTok nyata (opsional, berbayar)

`data/audience-followers-snapshot.js` diisi dari 5.000 follower nyata
`@amrijamaluddin_` yang ditarik lewat Apify actor
`clockworks/tiktok-followers-scraper`. Untuk regenerate dengan angka baru:

```bash
npm run pull-followers -- --handle amrijamaluddin_ --max 5000 --yes
```

**PERINGATAN: ini mengenakan biaya nyata ke akun Apify kamu** (~$1 per 1.000
follower saat ini). Script menolak jalan tanpa flag `--yes`, dan **tidak**
pernah dipanggil otomatis oleh `npm run refresh-data`. Butuh `APIFY_TOKEN` di
`.env.local`.

### Estimasi usia, gender, kota (atas permintaan eksplisit)

TikTok tidak pernah membuka field usia/gender/kota per-follower ke pihak
ketiga. Atas permintaan eksplisit, `data/audience-followers-snapshot.js` juga
berisi **estimasi statistik** (bukan pengukuran) untuk ketiganya:

- **Gender** — nama depan (nickName/name) dicocokkan ke kamus nama Indonesia;
  hanya ~13% follower yang bisa diklasifikasi langsung, sisanya diimputasi
  proporsional dari rasio itu.
- **Kota** — keyword wilayah di bio; hanya ~3.4% yang punya sinyal, sisanya
  diimputasi proporsional dari distribusi kota yang teridentifikasi.
- **Usia** — **tidak ada sinyal sama sekali** di data manapun; angkanya cuma
  asumsi pola umum pengguna TikTok Indonesia, sama untuk semua follower.

Semua ini diberi label "estimasi" secara eksplisit di UI (tab Audience,
section "Estimasi Usia, Gender & Kota") dan di komentar
`data/audience-followers-snapshot.js` — jangan disajikan ke pihak eksternal
sebagai fakta terukur tanpa disclosure itu.

## Menjalankan secara lokal

Butuh Node.js 18+ terpasang.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Refresh data dari database

Ketiga file di `data/*-snapshot.js` dibuat dari query ke Postgres. Untuk
memperbarui angkanya:

1. Salin `.env.example` ke `.env.local` dan isi kredensial DB (biasanya
   `localhost` untuk dev lokal).
2. Jalankan:
   ```bash
   npm run refresh-data
   ```
   Ini menjalankan `scripts/export-data.mjs`, yang query ulang tabel
   `l1_silver.mention` dan `l2_gold.*` untuk `subject_id='AJD'` dan `'KLK'`,
   lalu menulis ulang `data/ajd-snapshot.js`, `data/klk-snapshot.js`, dan
   `data/audience-snapshot.js`.
3. Review diff-nya, commit, lalu deploy ulang.

`.env.local` tidak pernah ikut ke git (lihat `.gitignore`) dan script ini
**tidak** dijalankan saat build di Vercel — hanya alat refresh lokal.

## Deploy ke Vercel

1. Push project ini ke sebuah repo Git (GitHub/GitLab/Bitbucket).
2. Import repo tersebut di [vercel.com/new](https://vercel.com/new) — Vercel
   otomatis mendeteksi Next.js, tidak perlu konfigurasi tambahan.
3. Karena datanya snapshot statis, **tidak ada environment variable yang
   wajib diisi di Vercel**.

## Catatan tentang data

- Database sumber (`kanalytics_spi_test`) ada di `localhost:5432` — Vercel
  (serverless/cloud) tidak bisa menjangkau `localhost` mesin kamu, jadi
  arsitektur snapshot ini memang pilihan yang tepat untuk setup saat ini.
- Entitas AJD memerlukan disambiguasi nama (nama umum "Amri"/"Jamaluddin").
  Dari ~4.190 mention mentah yang match keyword, hanya ~157 yang lolos
  klasifikasi `attribution_layer` (institutional/attributed/direct) sebagai
  benar-benar relevan dengan Bupati Kolaka — sisanya kemungkinan besar noise
  nama kembar. Dashboard ini memisahkan angka "relevan" vs "volume kotor"
  secara eksplisit di tiap chart.
- Kalau nanti databasenya dipindah ke host publik (Neon, Supabase, RDS
  dengan SSL, dll), dashboard ini bisa dikonversi ke live query dengan
  menambah Next.js API route yang pakai `pg` — struktur query-nya sudah ada
  di `scripts/export-data.mjs`, tinggal dipindah ke `app/api/.../route.js`.
