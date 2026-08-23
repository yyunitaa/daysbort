// Snapshot data untuk entitas AJD (Amri Jamaluddin, Bupati Kabupaten Kolaka).
// Sumber: PostgreSQL kanalytics_spi_test, tabel l1_silver.mention & l2_gold.*
// Untuk refresh, jalankan `npm run refresh-data` dengan koneksi DB yang valid
// (lihat scripts/export-ajd-data.mjs), lalu commit ulang file ini.

export const snapshotMeta = {
  subjectId: "AJD",
  subjectName: "Amri Jamaluddin",
  subjectTitle: "Bupati Kabupaten Kolaka",
  queryDate: "2026-08-23",
  source: "kanalytics_spi_test (PostgreSQL) — l1_silver.mention / l2_gold.*",
};

export const kpi = {
  relevantMentions: 157,
  rawMentions: 4190,
  positivePct: 65,
  netSentiment: "+59.2",
};

// Breakdown lengkap dari 4.190 unggahan mentah yang menyebut nama "Amri
// Jamaluddin"/"Amri". 3 baris pertama = 157 unggahan yang SUDAH DIPASTIKAN
// tentang beliau. Baris ke-4 ("review") menyaring unggahan yang menyebut
// wilayah Kolaka tapi belum pasti soal beliau secara pribadi. Baris terakhir
// (tier: "noise", 3.419 unggahan tanpa kata kunci wilayah sama sekali) TIDAK
// ditampilkan di UI (lihat SelfPerceptionTab.jsx, di-filter out) karena tidak
// relevan untuk ditunjukkan ke dashboard — datanya tetap disimpan di sini
// untuk ketertelusuran/dokumentasi, bukan dihapus dari catatan.
export const attributionData = [
  { label: "Langsung (Direct)", value: 8, note: "pernyataan resmi AJD", tier: "confirmed" },
  { label: "Institusional", value: 101, note: "akun resmi Pemkab/media lokal", tier: "confirmed" },
  { label: "Atribusi (Attributed)", value: 48, note: "disebut pihak ketiga dengan konteks jelas", tier: "confirmed" },
  { label: "Menyebut Kolaka, Tapi Belum Pasti Soal Beliau", value: 614, note: "ada kata \"Kolaka/Sultra\" tapi bisa jadi soal pejabat/topik lain, bukan beliau — perlu cek manual", tier: "review" },
  { label: "Kemungkinan Besar Bukan Tentang Beliau", value: 3419, note: "tidak ada kata kunci wilayah Kolaka sama sekali — kemungkinan besar cuma kebetulan nama sama (noise)", tier: "noise" },
];

export const platformData = [
  { platform: "TikTok", value: 80 },
  { platform: "Instagram", value: 76 },
  { platform: "YouTube", value: 1 },
];

export const audienceSegmentData = [
  { name: "Konsumen (warga umum)", value: 3671 },
  { name: "Institusional", value: 476 },
  { name: "Buzzer terindikasi", value: 43 },
];

export const sentimentTrend = [
  { week: "29 Jun", positif: 8, netral: 0, negatif: 0 },
  { week: "6 Jul", positif: 5, netral: 7, negatif: 0 },
  { week: "13 Jul", positif: 3, netral: 2, negatif: 0 },
  { week: "20 Jul", positif: 9, netral: 2, negatif: 1 },
  { week: "27 Jul", positif: 2, netral: 4, negatif: 2 },
  { week: "3 Agu", positif: 41, netral: 25, negatif: 4 },
  { week: "10 Agu", positif: 18, netral: 3, negatif: 1 },
  { week: "17 Agu", positif: 16, netral: 3, negatif: 1 },
];

export const volumeTrend = [
  { week: "29 Jun", volume: 255 },
  { week: "6 Jul", volume: 129 },
  { week: "13 Jul", volume: 172 },
  { week: "20 Jul", volume: 366 },
  { week: "27 Jul", volume: 274 },
  { week: "3 Agu", volume: 435 },
  { week: "10 Agu", volume: 718 },
  { week: "17 Agu", volume: 1798 },
];

export const topicEngagement = [
  { title: "Birokrasi & ASN", eng: 206.0 },
  { title: "Gaya Komunikasi", eng: 91.4 },
  { title: "Pelayanan Publik", eng: 52.0 },
  { title: "Infrastruktur Jalan", eng: 42.0 },
  { title: "Penampilan Publik", eng: 23.5 },
];

export const topTopicsVolume = [
  { topic: "Lainnya (belum dikategorikan)", category: "Lainnya", n: 61, net: 70.5 },
  { topic: "Penampilan Publik", category: "Isu Personal", n: 21, net: 85.7 },
  { topic: "Respons Isu Tambang", category: "Isu Kebijakan", n: 17, net: 5.9 },
  { topic: "Birokrasi & ASN", category: "Isu Kinerja", n: 12, net: 91.7 },
  { topic: "Pernyataan Kontroversial", category: "Isu Personal", n: 8, net: 0.0 },
  { topic: "Infrastruktur Jalan", category: "Isu Kebijakan", n: 8, net: 100.0 },
  { topic: "Spillover Kasus Wabup", category: "Isu Latar Institusional", n: 6, net: -16.7 },
];

export const riskRadar = {
  topicLabel: "Spillover Kasus Wabup",
  categoryLabel: "Isu Latar Institusional",
  nNegativeLast7d: 1,
  nNegativePrior7d: 1,
  delta7d: 0,
  isTrueVelocity: false,
  caveat: "Proxy volume, bukan velocity real-time.",
};

export const topContent = [
  { handle: "@kolakainfo", platform: "Instagram", text: "Anggota DPRD Kabupaten Kolaka Fraksi PKS mengusulkan agar kelompok \"boti-boti\" tidak diikutsertakan dalam...", sentiment: "netral", likes: 13473 },
  { handle: "@sultrafeeds", platform: "TikTok", text: "KOLAKA -- Anggota DPRD Kabupaten Kolaka dari Fraksi PKS meminta Pemkab Kolaka agar kelompok yang dikenal se...", sentiment: "netral", likes: 7017 },
  { handle: "@amrijamaluddin_", platform: "TikTok", text: "Melakukan peninjauan dan pengecekan gudang aset Pemerintah Kabupaten Kolaka sebagai bagian dari inventarisasi aset...", sentiment: "positif", likes: 1824 },
  { handle: "@kolakainfo", platform: "Instagram", text: "Upacara peringatan HUT ke-81 RI berlangsung khidmat di Lapangan Alun-Alun Kolaka, Senin (17/8/2026)...", sentiment: "positif", likes: 1643 },
  { handle: "@amri_djamaluddin", platform: "Instagram", text: "Atas nama Pemerintah Kabupaten Kolaka, kami mengajak seluruh masyarakat menjadikan peringatan HUT RI ke-81 seb...", sentiment: "positif", likes: 1265 },
  { handle: "@kolakainfo", platform: "Instagram", text: "PT Satria Jaya Sultra (SJS) berhasil meraih Juara II Lomba Gerak Jalan Umum HUT RI...", sentiment: "positif", likes: 922 },
  { handle: "@amrijamaluddin_", platform: "TikTok", text: "Melaksanakan inspeksi mendadak (sidak) pada sejumlah ruangan SKPD di lingkungan Pemkab Kolaka...", sentiment: "netral", likes: 880 },
  { handle: "@kolakainfo", platform: "Instagram", text: "Bupati Kolaka H. Amri angkat bicara terkait ketegangan di jalur logistik (hauling) kawasan PSN PT Indonesia P...", sentiment: "positif", likes: 824 },
  { handle: "@kolakaupdate", platform: "Instagram", text: "Aktivis dakwah di Kabupaten Kolaka mengusulkan agar kelompok \"boti-boti\" tidak diikutsertakan...", sentiment: "netral", likes: 771 },
  { handle: "@kolakainfo", platform: "Instagram", text: "Pemerintah Kabupaten Kolaka memastikan ketersediaan BBM di wilayah Kabupaten Kolaka dalam kondisi aman...", sentiment: "netral", likes: 583 },
];
