# Recap: Login, Organisasi, Figur & Member

Ringkasan fitur yang dibangun di sesi ini untuk Kanalytics — dari halaman
login sampai sistem role & akses figur per organisasi.

## 1. Landing Page & Autentikasi

- **`/`** — landing page publik platform Kanalytics (hero, fitur, CTA).
- **`/register`** — daftar akun: username, email, password, konfirmasi
  password. Email harus **unik**, username **boleh sama** dengan akun lain.
  Setelah berhasil, tampil notifikasi sukses lalu redirect ke `/login`
  (tidak auto-login).
- **`/login`** — masuk pakai **email** + password (bukan username).
- Password di-hash pakai bcrypt. Session disimpan sebagai cookie
  ber-signature HMAC (`lib/auth.js`), butuh env var `SESSION_SECRET`.
- **`/welcome`** — halaman sesudah login: tagline Kanalytics + tombol
  "Eksplor". Kalau akun belum punya organisasi → diarahkan ke
  `/organization/new`. Kalau sudah → ke `/organization/figures`.

## 2. Organisasi (Multi-Organisasi)

- Satu akun bisa tergabung di **lebih dari satu organisasi** (many-to-many
  lewat tabel `user_organizations`), tapi cuma satu yang **aktif** dalam satu
  waktu (`users.organization_id`).
- **`/organization/new`** — buat organisasi baru. Organisasi baru otomatis
  jadi organisasi aktif, dan pembuatnya otomatis dapat role **Super Admin**.
- **`/organization`** — halaman detail: organisasi aktif (jumlah figur & akun
  tergabung) + daftar organisasi lain yang diikuti, dengan tombol "Jadikan
  Aktif" untuk pindah organisasi aktif.
- Sidebar: bagian **Organisasi** menampilkan nama organisasi aktif langsung
  (bukan label generik), bisa di-klik untuk expand daftar semua organisasi
  yang diikuti (klik salah satu = pindah organisasi aktif), dan ada
  "+ Organisasi" di bawahnya buat bikin organisasi baru.

## 3. Figur

- **`/organization/figures`** — daftar figur dalam organisasi aktif. Admin
  bisa tambah figur baru lewat form inline (nama + jabatan, opsional).
- **`/dashboard/[figureId]`** — dashboard per figur, dengan 3 tab: **Citra
  Pribadi**, **Kabupaten Kolaka**, **Audience**.
  - Tab **Kabupaten Kolaka** cuma muncul untuk figur yang tertaut ke data
    asli AJD (`subject_id = 'AJD'`) — figur lain cuma dapat 2 tab.
  - Figur yang belum tertaut data asli tetap bisa dibuka dashboardnya, tapi
    semua chart/tabel **kosong** (bukan menampilkan data AJD sebagai contoh),
    plus banner disclaimer merah yang jelas. Lihat `data/empty/*-snapshot.js`
    (bentuk kosong, struktur sama persis dengan data asli).
  - Header dashboard: nama figur bisa diklik untuk **expand ke figur lain**
    yang bisa diakses (quick switch), tanpa perlu balik ke halaman Pilih
    Figur.
- **`/dashboard/[figureId]/report`** — halaman Report per figur (placeholder
  "segera hadir", tapi sudah figur-spesifik & terproteksi akses).
- Figur terakhir yang dikunjungi diingat lewat cookie `current_figure_id`
  (`middleware.js` + `lib/current-figure.js`), supaya menu sidebar (Report,
  submenu Dashboard) dari halaman lain (Member/Setting/Organisasi) tetap
  kembali ke figur yang sama, bukan ke pemilih figur.

## 4. Role & Akses Figur

3 role per (akun, organisasi), disimpan di `user_organizations.role`:

| Role | Bisa kelola figur/member? | Figur yang kelihatan di daftar | Figur yang bisa DIMASUKI |
|---|---|---|---|
| **Super Admin** | Ya | Semua | Semua (checklist diabaikan) |
| **Admin** | Ya | Semua (yang tanpa akses tampil abu-abu + tooltip "Anda tidak punya akses untuk figur ini") | Cuma yang di-checklist |
| **Member** | Tidak (view only) | Cuma yang di-checklist (yang lain disembunyikan total) | Cuma yang di-checklist |

- Super Admin dipegang otomatis oleh pembuat organisasi. Role ini **tidak
  bisa diberikan** lewat form Tambah Member kecuali oleh Super Admin lain, dan
  **tidak bisa diubah/dihapus** sama sekali lewat halaman Member (dilindungi
  di UI & API) — mencegah demote/hapus tidak sengaja.
- Kalau seorang Admin (bukan Super Admin) bikin figur baru, dia otomatis
  dapat akses ke figur itu (supaya tidak langsung terkunci dari buatannya
  sendiri).
- Penegakan akses ada di `lib/figure-access.js` (dipakai di halaman dashboard,
  report, dan daftar figur) — 403/404 kalau akses figur di luar izin.

## 5. Halaman Member (`/member`)

- Menampilkan daftar akun yang tergabung di organisasi aktif: username,
  email, role.
- **Admin/Super Admin** bisa klik "+ Tambah Member":
  1. Cari akun berdasarkan **email**.
     - Email tidak terdaftar di sistem → "Email tidak terdaftar."
     - Email sudah jadi member organisasi ini → "Email sudah terdaftar
       dalam organisasi." (arahkan pakai tombol Edit di baris membernya
       kalau mau ubah).
  2. Kalau ketemu & belum jadi member → pilih role (Super Admin*/Admin/
     Member).
  3. Checklist figur mana saja dari organisasi itu yang diberi akses (kalau
     role Super Admin, checklist ini disembunyikan karena tidak relevan).
  4. Simpan.
- Tombol Edit (✏️) & Hapus (🗑️) per baris member (kecuali baris Super Admin
  — tombolnya disembunyikan; dan tidak bisa hapus diri sendiri).
- Kalau akun yang ditambahkan belum punya organisasi aktif sama sekali,
  organisasi ini otomatis jadi aktif buat mereka.

*Pilihan role "Super Admin" di form cuma muncul kalau yang login juga Super
Admin.

## 6. Sidebar

Struktur menu dari atas ke bawah:

1. Logo "K" Kanalytics (bisa collapse/expand pakai tombol chevron — saat
   collapse, sidebar menyempit jadi ikon saja).
2. **Organisasi** (nama organisasi aktif, expand untuk pindah organisasi) +
   **+ Organisasi**.
3. **Dashboard** dengan submenu Citra Pribadi / Kabupaten Kolaka* / Audience.
4. **Report**
5. **Figur**
6. **Member**
7. **Setting**
8. Paling bawah: **Akun** — ikon profil, username, email, tombol **Keluar**.

*Submenu Kabupaten Kolaka cuma muncul kalau figur yang sedang aktif tertaut
data asli AJD.

Sidebar bersifat `sticky` setinggi viewport (bukan `min-h-screen` di dalam
flex row) supaya bagian Akun di bawah tidak ikut terdorong keluar layar saat
tab dashboard yang aktif punya konten panjang (mis. tab Audience).

## 7. Skema Database (skema `public`)

Migrasi ada di `scripts/migrations/001_*.sql` s.d. `006_*.sql`, dijalankan
lewat `npm run migrate` (idempotent — sudah dilacak di tabel
`schema_migrations`).

- `users` (id, username, email UNIQUE, password_hash, organization_id aktif)
- `organizations` (id, name UNIQUE)
- `user_organizations` (user_id, organization_id, role) — keanggotaan +
  role, many-to-many
- `figures` (id, organization_id, name, title, subject_id nullable)
- `figure_access` (user_id, figure_id) — checklist akses figur per akun

## 8. Catatan Penting

- Semua fitur ini butuh koneksi DB langsung (`DB_HOST` dkk di `.env.local`),
  sama seperti `npm run refresh-data`. **Belum** dipasang untuk Vercel karena
  DB masih di `localhost`.
- Data dashboard (`data/*-snapshot.js`) masih snapshot statis dari
  `kanalytics_spi_test` — cuma figur AJD yang beneran tertaut data asli.
  Figur lain "struktur dulu, data nyusul".
