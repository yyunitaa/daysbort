// Snapshot data untuk entitas KLK (Kabupaten Kolaka — wilayah yang dipimpin AJD).
// Sumber: PostgreSQL kanalytics_spi_test, tabel l1_silver.mention & l2_gold.*
// Untuk refresh, jalankan `npm run refresh-data`, lalu commit ulang file ini.

export const snapshotMeta = {
  subjectId: "KLK",
  subjectName: "Kabupaten Kolaka",
  queryDate: "2026-08-23",
  source: "kanalytics_spi_test (PostgreSQL) — l1_silver.mention / l2_gold.*",
};

export const kpi = {
  relevantMentions: 1343,
  rawMentions: 5532,
  positivePct: 60,
  netSentiment: "+36.9",
};

export const platformData = [
  { platform: "TikTok", value: 633, pos: 372, neg: 111, neu: 150 },
  { platform: "X", value: 351, pos: 218, neg: 91, neu: 42 },
  { platform: "YouTube", value: 225, pos: 134, neg: 72, neu: 19 },
  { platform: "Instagram", value: 134, pos: 77, neg: 31, neu: 26 },
];

export const sentimentTrend = [
  { week: "29 Jun", positif: 9, netral: 5, negatif: 6 },
  { week: "6 Jul", positif: 9, netral: 5, negatif: 3 },
  { week: "13 Jul", positif: 15, netral: 2, negatif: 6 },
  { week: "20 Jul", positif: 59, netral: 16, negatif: 21 },
  { week: "27 Jul", positif: 357, netral: 102, negatif: 147 },
  { week: "3 Agu", positif: 127, netral: 22, negatif: 44 },
  { week: "10 Agu", positif: 161, netral: 62, negatif: 59 },
  { week: "17 Agu", positif: 65, netral: 23, negatif: 19 },
];

export const volumeTrend = [
  { week: "29 Jun", volume: 153 },
  { week: "6 Jul", volume: 233 },
  { week: "13 Jul", volume: 208 },
  { week: "20 Jul", volume: 563 },
  { week: "27 Jul", volume: 1080 },
  { week: "3 Agu", volume: 910 },
  { week: "10 Agu", volume: 1369 },
  { week: "17 Agu", volume: 994 },
];

export const topicEngagement = [
  { title: "Ekonomi UMKM & Pertanian", eng: 203.3 },
  { title: "Tambang Nikel & Ekonomi", eng: 198.0 },
  { title: "Pariwisata & Sosial Daerah", eng: 158.3 },
  { title: "Pelayanan Publik", eng: 59.6 },
];

export const topTopicsVolume = [
  { topic: "Lainnya (belum dikategorikan)", category: "Lainnya", n: 1226, net: 42.7 },
  { topic: "Sengketa Lahan Tambang", category: "Isu Lingkungan & Sengketa Lahan", n: 51, net: -86.3 },
  { topic: "Tambang Nikel & Ekonomi", category: "Isu Kebijakan", n: 13, net: 61.5 },
  { topic: "Pelayanan Publik", category: "Isu Kinerja", n: 11, net: 36.4 },
  { topic: "Ekonomi UMKM & Pertanian", category: "Isu Kinerja", n: 10, net: 100.0 },
  { topic: "Pariwisata & Sosial Daerah", category: "Isu Personal", n: 10, net: 100.0 },
  { topic: "Tambang Ilegal", category: "Isu Lingkungan & Sengketa Lahan", n: 7, net: -71.4 },
];

// delta7d > 0 berarti mention negatif NAIK minggu ini dibanding minggu sebelumnya (memburuk).
export const riskRadar = [
  { topic: "Pencemaran Lingkungan", category: "Isu Lingkungan & Sengketa Lahan", last7d: 3, prior7d: 0, delta: 3 },
  { topic: "Pelayanan Publik", category: "Isu Kinerja", last7d: 1, prior7d: 0, delta: 1 },
  { topic: "Tambang Ilegal", category: "Isu Lingkungan & Sengketa Lahan", last7d: 1, prior7d: 1, delta: 0 },
  { topic: "Lainnya (belum dikategorikan)", category: "Lainnya", last7d: 14, prior7d: 22, delta: -8 },
  { topic: "Sengketa Lahan Tambang", category: "Isu Lingkungan & Sengketa Lahan", last7d: 1, prior7d: 39, delta: -38 },
];

export const topContent = [
  { handle: "@sinjai.update", platform: "TikTok", text: "Anggota DPRD Kabupaten Kolaka dari Fraksi PKS, Bahana Alam Sultan, menyampaikan usulan kepada Pemkab Kolaka agar kelompok yang dikenal se...", sentiment: "negatif", likes: 7848 },
  { handle: "@zhiaq5", platform: "TikTok", text: "Viral — fenomena tak biasa terjadi di pesisir Desa Ladahai, Kabupaten Kolaka, Sulawesi Tenggara: ratusan ekor ikan tembang terlihat...", sentiment: "netral", likes: 6332 },
  { handle: "@ig.rastyy_144", platform: "TikTok", text: "Cewe kolaka #sulawesitenggara #pomalaa #kolaka #fyp", sentiment: "netral", likes: 6256 },
  { handle: "@kolakaupdate", platform: "Instagram", text: "KOLAKA – Kisah perjuangan ayah tunggal asal Kabupaten Kolaka, Sulawesi Tenggara, Tri Rama Dandi (Om Maxim), terus menarik perhatian...", sentiment: "netral", likes: 5638 },
];

export const noteHeadlineRisk = {
  rising: "Pencemaran Lingkungan",
  fading: "Sengketa Lahan Tambang (mereda tajam: 39 → 1 mention negatif/minggu)",
};
