// Follower base TikTok @amrijamaluddin_ — data REAL (bukan hasil pipeline
// mention/komentar seperti data/audience-snapshot.js), ditarik lewat Apify
// actor clockworks/tiktok-followers-scraper.
//
// Untuk regenerate: `npm run pull-followers` (lihat scripts/pull-followers.mjs).
// PERINGATAN: script itu MENGENAKAN BIAYA NYATA ke akun Apify (~$1 per 1.000
// follower) — tidak dijalankan otomatis oleh `npm run refresh-data`, dan
// scriptnya sendiri butuh flag --yes eksplisit supaya tidak ke-trigger sengaja.
//
// Field yang TERSEDIA dari TikTok followers API: fans, following, verified,
// privateAccount, signature (bio), video count. Field yang TIDAK TERSEDIA sama
// sekali dari API ini: usia, gender, kota/lokasi terstruktur. "Sinyal kota" di
// bawah cuma hasil cari kata kunci wilayah di teks bio (coverage rendah, self-
// reported, bukan data demografis resmi) — dipisah jelas dari klaim "kota asli".

export const meta = {
  actor: "clockworks/tiktok-followers-scraper",
  targetHandle: "amrijamaluddin_",
  pulledAt: "2026-08-23",
  costUsd: 5.0,
  apifyRunId: "6oCCqhjxKtsd3p1f7",
};

// ---------- Estimasi Gender, Kota, Usia (ATAS PERMINTAAN EKSPLISIT USER) ----------
// TikTok tidak pernah memberi field usia/gender/kota per-follower ke pihak
// ketiga — angka di bawah BUKAN pengukuran, tapi estimasi statistik dari 3
// metode berbeda, dengan tingkat keyakinan yang berbeda-beda:
//
// 1) genderData — nama depan (nickName/name) dicocokkan ke kamus nama
//    Indonesia umum. Hanya 13.1% (657/5000) follower yang punya nama
//    cukup jelas untuk diklasifikasi langsung (rasio hasil: 437 M / 220 F).
//    Sisanya 86.9% diimputasi PROPORSIONAL memakai rasio itu (bukan random
//    50/50) — asumsinya follower dengan nama ambigu punya rasio gender yang
//    mirip dengan yang bisa diidentifikasi. Confidence: RENDAH-SEDANG.
//
// 2) cityData — bio (signature) dicocokkan ke keyword wilayah. Hanya 3.4%
//    (171/5000) yang bio-nya menyebut nama kota/wilayah eksplisit. Sisanya
//    96.6% diimputasi PROPORSIONAL memakai distribusi kota yang sama dari
//    171 sampel itu (mis. kalau di antara yang diketahui 61% menyebut
//    Kolaka, maka ~61% dari yang tidak diketahui juga diberi label Kolaka).
//    Confidence: RENDAH (basis sampel sangat kecil, 3.4% dari total).
//
// 3) ageData — TIDAK ADA sinyal sama sekali per-follower (tidak ada satupun
//    field bio/nama yang berkorelasi dengan usia). Distribusi di bawah
//    murni asumsi struktural memakai pola umum basis pengguna TikTok
//    Indonesia (skew ke 18-34 tahun) — SAMA UNTUK SEMUA FOLLOWER, tidak
//    berasal dari data followers ini sama sekali. Confidence: SANGAT RENDAH,
//    ini bukan estimasi per-individu, hanya angka placeholder yang masuk akal.
//
// JANGAN sajikan angka-angka ini ke pihak eksternal tanpa disclosure di atas.

export const genderData = [
  { name: "Laki-laki", value: 3326 },
  { name: "Perempuan", value: 1674 },
];

export const genderMeta = {
  classifiedFromNamePct: 13.1,
  classifiedCount: 657,
  imputedCount: 4343,
  method: "Kamus nama Indonesia pada nickName/name; sisanya diimputasi proporsional dari rasio M/F yang teridentifikasi (437 M / 220 F).",
};

export const cityData = [
  { city: "Kolaka", value: 3020 },
  { city: "Sulawesi Tenggara (umum)", value: 713 },
  { city: "Denpasar/Bali", value: 449 },
  { city: "Kendari", value: 347 },
  { city: "Makassar", value: 192 },
  { city: "Pomalaa", value: 161 },
  { city: "Wundulako", value: 60 },
  { city: "Semarang", value: 58 },
];

export const cityMeta = {
  classifiedFromBioPct: 3.4,
  classifiedCount: 171,
  imputedCount: 4829,
  method: "Keyword wilayah pada bio (signature); sisanya diimputasi proporsional dari distribusi kota yang teridentifikasi di 171 bio tsb.",
};

export const ageData = [
  { range: "13-17", value: 400 },
  { range: "18-24", value: 1650 },
  { range: "25-34", value: 1500 },
  { range: "35-44", value: 850 },
  { range: "45-54", value: 400 },
  { range: "55+", value: 200 },
];

export const ageMeta = {
  classifiedFromDataPct: 0,
  method: "TIDAK ada sinyal usia per-follower di data manapun. Angka ini adalah asumsi distribusi umum pengguna TikTok Indonesia (skew 18-34 tahun), diterapkan rata ke semua follower — bukan estimasi individual.",
};

export const followerOverview = {
  totalSampled: 5000,
  verifiedPct: 0.0,
  privateAccountPct: 14.5,
  hasBioPct: 37.0,
  avgFans: 615,
  avgFollowing: 1289,
  medianFans: 133,
  maxFans: 76600,
};

export const followerTiers = [
  { tier: "Kecil (<100 pengikut)", value: 2147 },
  { tier: "Menengah-kecil (100–1rb)", value: 2140 },
  { tier: "Menengah (1rb–10rb)", value: 675 },
  { tier: "Besar (10rb–100rb)", value: 38 },
];

// Hasil cari kata kunci wilayah Sultra/Kolaka di teks bio follower — BUKAN data
// demografis kota yang valid, hanya proxy kasar dengan coverage sangat rendah.
export const followerLocationSignal = {
  localMentioned: 149,
  otherCityMentioned: 24,
  noLocationInfo: 4827,
  topLocalKeywords: [
    { keyword: "kolaka", n: 104 },
    { keyword: "sulawesi tenggara", n: 15 },
    { keyword: "sultra", n: 14 },
    { keyword: "kendari", n: 8 },
    { keyword: "pomalaa", n: 4 },
  ],
};

// Follower dengan jumlah fans terbesar — potensi jangkauan amplifikasi, TAPI
// mayoritas ternyata akun hiburan/konten umum yang tidak terkait AJD sama
// sekali (follow kemungkinan besar algoritmik) — bukan sinyal dukungan.
export const topInfluentialFollowers = [
  { handle: "@kusukaasmr", nickname: "KUSUKA ASMR", fans: 76600, bio: "Jangan lupa follow" },
  { handle: "@75sultansuljum", nickname: "sultan suljum 75", fans: 63700, bio: "" },
  { handle: "@diman_ripiuuu", nickname: "diman_ripiuuu", fans: 59100, bio: "Kreator review, ngeripiu" },
  { handle: "@cerita_rakyat.id", nickname: "CERITA RAKYAT", fans: 48200, bio: "Media informasi digital nasional" },
  { handle: "@sepaktakrawberua", nickname: "STB berua Official", fans: 47800, bio: "Konten sepaktakraw" },
  { handle: "@sipaling_jalan2", nickname: "JELAJAH INDONESIA", fans: 43000, bio: "Explore-Travel-Repeat" },
  { handle: "@utari_poe", nickname: "IG @utaripoe", fans: 37400, bio: "" },
  { handle: "@rumahjoglorumahkayu", nickname: "Rumah Joglo_Rumah Kayu", fans: 28100, bio: "Produksi rumah joglo/kayu" },
  { handle: "@russ_068", nickname: "Jalkotzz", fans: 27700, bio: "" },
  { handle: "@livylove10", nickname: "livy", fans: 27100, bio: "" },
];
