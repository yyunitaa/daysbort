// Penjelasan singkat tiap topik di tab My Regency, ditampilkan sebagai tooltip
// saat hover. Ditulis berdasarkan cuplikan mention asli per topik di
// l1_silver.mention (subject_id='KLK'), bukan tebakan dari nama topik saja.

export const topicDescriptions = {
  "Lainnya": "Percakapan umum yang menyebut Kolaka tapi belum masuk kategori topik spesifik — mulai dari berita nasional yang kebetulan menyebut lokasi, kisah viral warga, sampai info umum seputar daerah.",
  "Sengketa Lahan Tambang": "Konflik lahan dan ketegangan di kawasan tambang nikel — termasuk sengketa klaim lahan warga, gesekan di jalur hauling (PSN PT IPIP), dan gugatan hukum terkait.",
  "Tambang Nikel & Ekonomi": "Dampak ekonomi industri nikel di Kolaka — investasi, rekrutmen tenaga kerja lokal, dan kunjungan pejabat/perusahaan tambang ke daerah.",
  "Pelayanan Publik": "Persepsi warga terhadap kinerja pelayanan Pemerintah Kabupaten — infrastruktur kota, tata ruang, dan program/fasilitas publik.",
  "Ekonomi UMKM & Pertanian": "Aktivitas ekonomi lokal di luar sektor tambang — UMKM, bisnis kuliner/ritel, dan komunitas ekonomi kreatif anak muda Kolaka.",
  "Pariwisata & Sosial Daerah": "Konten wisata dan keindahan alam Kolaka — pantai, jembatan, jalur wisata, biasanya dari konten promosi warga atau kreator lokal.",
  "Tambang Ilegal": "Sorotan terhadap perusahaan tambang yang beroperasi tanpa izin resmi terdaftar — isu legalitas izin usaha pertambangan (IUP).",
  "Pencemaran Lingkungan": "Insiden lingkungan di sekitar kawasan tambang — kebakaran lahan/kendaraan di jalur hauling, dan dampak operasional tambang terhadap lingkungan sekitar.",
};

// title dari data snapshot kadang punya suffix "(belum dikategorikan)" dsb —
// fungsi ini menstripnya sebelum lookup supaya tetap cocok.
export function getTopicDescription(title) {
  if (!title) return null;
  const base = title.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return topicDescriptions[base] || null;
}
