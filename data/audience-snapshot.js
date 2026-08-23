// Snapshot data untuk tab Audience (basis pendukung/komunitas AJD).
// Sumber: PostgreSQL kanalytics_spi_test, l1_silver.mention, subject_id='AJD',
// dibatasi ke mention yang sudah lolos klasifikasi attribution_layer (relevan).
//
// PENTING: database ini TIDAK punya field usia, gender, atau kota domisili
// audiens — data itu tidak tersedia dari pipeline scraping (Apify) yang jadi
// sumber data. Tab ini memakai sinyal perilaku yang memang tersedia sebagai
// proxy: platform, segmen audiens, emosi, dan akun yang menunjukkan dukungan
// eksplisit terhadap AJD — sebagai starting point daftar komunitas, bukan
// data demografis asli.

export const snapshotMeta = {
  subjectId: "AJD",
  queryDate: "2026-08-23",
  source: "kanalytics_spi_test (PostgreSQL) — l1_silver.mention (attribution_layer relevan) + Apify clockworks/tiktok-followers-scraper (5.000 follower @amrijamaluddin_, ditarik 2026-08-23, ~$5)",
  missingFields: ["usia", "gender", "kota domisili (akurat)"],
};

export const kpi = {
  communityCandidates: 48,
  segmentSplit: "52% Warga Biasa / 48% Akun Resmi",
  topPlatformShare: "TikTok 51%",
  botDetected: 0,
};

export const segmentData = [
  { name: "Warga Biasa", value: 81, avgFollowers: 6299 },
  { name: "Akun Resmi/Media", value: 76, avgFollowers: 26710 },
];

export const platformActivity = [
  { platform: "TikTok", value: 80 },
  { platform: "Instagram", value: 76 },
  { platform: "YouTube", value: 1 },
];

export const emotionData = [
  { emotion: "Netral", value: 90 },
  { emotion: "Dukungan", value: 63 },
  { emotion: "Kecewa", value: 2 },
  { emotion: "Marah", value: 1 },
  { emotion: "Sinis", value: 1 },
];

// Akun publik (bukan institusi) dengan emosi "dukungan" eksplisit terhadap AJD —
// kandidat awal untuk dibina jadi komunitas pendukung.
export const communitySupporters = [
  { handle: "@bahtra_banong", platform: "TikTok", followers: 10614, text: "Minggu pagi bersama Bupati Kolaka @amri_djamaluddin, jalan pagi dulu guys By Pass Kolaka..", likes: 307 },
  { handle: "@www.kisahan.id", platform: "TikTok", followers: 4248, text: "Ketua Umum KONI Sulawesi Tenggara melantik Wakil Bupati Kolaka, Husmaluddin, sebagai Ketua Komisi...", likes: 33 },
  { handle: "@firlanberkarya", platform: "TikTok", followers: 2470, text: "Ada komentar terkait jalan kabupaten ini, dan komentar itu kami sampaikan sebagai masukan kepada bupati...", likes: 88 },
  { handle: "@yunusbinmuhammad", platform: "TikTok", followers: 249, text: "Keren Bupati Kolaka #kolaka", likes: 49 },
  { handle: "@fulana1397", platform: "TikTok", followers: 54, text: "Kedatangan bapak bupati Kolaka #sulawesitenggara", likes: 4 },
  { handle: "@hardi.anto882", platform: "TikTok", followers: null, text: "Setuju kalau perlu ditindak tegas.", likes: 359 },
  { handle: "@m4rgin_call", platform: "TikTok", followers: null, text: "Sangat setuju pak", likes: 64 },
  { handle: "@ibe12111980", platform: "TikTok", followers: null, text: "Betul sekali, dari hal kecil nanti bisa jadi hal yang besar", likes: 36 },
  { handle: "@bunga.cempaka828", platform: "TikTok", followers: null, text: "Betul pak, saya dari Ternate sangat setuju", likes: 16 },
  { handle: "@akagami.no.shanks840", platform: "TikTok", followers: null, text: "Mantap pak, sikap tegas yang luar biasa", likes: 10 },
];

// Akun resmi/media lokal paling aktif memberitakan AJD secara positif — bukan
// komunitas organik, tapi jadi kanal distribusi utama.
export const officialAccounts = [
  { handle: "@diskominfokolaka", platform: "Instagram", posts: 22, engagement: 518 },
  { handle: "@kolakainfo", platform: "Instagram", posts: 10, engagement: 5431 },
  { handle: "@amri_djamaluddin", platform: "Instagram", posts: 5, engagement: 2089 },
  { handle: "@infoviralkolaka", platform: "Instagram", posts: 5, engagement: 37 },
  { handle: "@amrijamaluddin_", platform: "TikTok", posts: 3, engagement: 2283 },
];
