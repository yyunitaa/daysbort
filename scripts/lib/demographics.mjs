// Estimasi usia/gender/kota dari follower TikTok/Instagram — TIDAK PERNAH
// tersedia sebagai field terukur dari API manapun, cuma proxy statistik dari
// nickName/bio. Metodologi ini mereplikasi yang sudah dipakai untuk AJD
// (data/audience-followers-ajd-snapshot.js, dibuat manual sebelum script ini
// ada) supaya konsisten lintas subject — lihat README.md § "Estimasi usia,
// gender, kota" untuk disclosure lengkap ke pembaca.
//
// SEMUA angka di sini adalah ESTIMASI, bukan pengukuran:
// - gender: dicocokkan dari nama depan ke kamus nama Indonesia umum di bawah
//   (daftar common-name, BUKAN database lengkap — banyak nickName media
//   sosial bukan nama asli sama sekali, jadi classifiedFromNamePct rendah
//   secara struktural, bukan bug).
// - kota: dicocokkan dari keyword wilayah di bio, coverage rendah karena
//   kebanyakan orang tidak menyebut kota di bio.
// - usia: TIDAK ADA sinyal sama sekali di data manapun — angkanya asumsi
//   struktural (skew pengguna TikTok/Instagram Indonesia 18-34 tahun), SAMA
//   untuk semua subject, bukan hasil analisis per-follower.
//
// Baik gender maupun kota diklasifikasi langsung dulu, SISANYA diimputasi
// PROPORSIONAL dari rasio/distribusi yang teridentifikasi (bukan random),
// dengan asumsi eksplisit: follower yang tidak teridentifikasi punya rasio
// yang mirip dengan yang teridentifikasi. Confidence rendah-sedang, harus
// selalu ditampilkan dengan disclosure di UI (lihat AudienceTab.jsx).

const MALE_NAMES = new Set([
  "muhammad", "muhamad", "mohammad", "mohamad", "ahmad", "achmad", "budi", "agus", "andi",
  "joko", "eko", "dedi", "dedy", "hendra", "rudi", "rudy", "ari", "ary", "arief", "arif",
  "bayu", "bagus", "bambang", "bagas", "dimas", "doni", "donny", "fajar", "faisal", "fauzi",
  "fikri", "gilang", "hadi", "hardi", "hasan", "husein", "husni", "ilham", "imam", "indra",
  "irfan", "iwan", "jaka", "junaidi", "kurniawan", "lukman", "luthfi", "mahmud", "mahendra",
  "maulana", "nanang", "nasrul", "rahman", "rahmat", "ramadhan", "ramdhan", "ridwan", "rizal",
  "rizky", "riski", "rian", "ryan", "robby", "roni", "ronny", "sandi", "satria", "setiawan",
  "slamet", "sugeng", "suryadi", "susanto", "suhendra", "taufik", "teguh", "tommy", "tomi",
  "umar", "wahyu", "wawan", "wibowo", "wisnu", "yanto", "yudi", "yudha", "yoga", "yusuf",
  "zaenal", "zainal", "zulkifli", "panji", "aditya", "adi", "aji", "akbar", "alfian", "ali",
  "alif", "amin", "anwar", "arya", "asep", "azis", "aziz", "budiman", "danang", "dani",
  "danny", "darma", "denny", "deny", "dony", "edi", "eddy", "edwin", "erik", "erick", "erwin",
  "fadli", "fadil", "fahmi", "febri", "ferdi", "ferdy", "gading", "galang", "hakim", "halim",
  "hamid", "harry", "hari", "heri", "herry", "herman", "hidayat", "ikhsan", "iksan", "irwan",
  "isman", "jefri", "jefry", "kamal", "kevin", "khoirul", "krisna", "made", "maulidi",
  "murtadho", "nizar", "nugroho", "oki", "okky", "opan", "panca", "pandu", "pratama",
  "purnomo", "putra", "rafi", "rafly", "raka", "ramli", "reza", "ricky", "riko", "rio",
  "sahrul", "saiful", "samsul", "sandy", "sapto", "sigit", "sukarno", "sulaiman", "surya",
  "syarif", "taufan", "teddy", "tegar", "tio", "tono", "triyono", "ujang", "wahid", "wawang",
  "wibisono", "wildan", "yance", "yanuar", "yasin", "yayan", "yoyo", "yulianto", "yusril",
  "zacky", "zaki", "gede", "putu", "wayan", "komang", "dodi", "dody", "asnawi", "syahrul",
]);

const FEMALE_NAMES = new Set([
  "siti", "sri", "dewi", "ratna", "ratih", "wati", "yanti", "ani", "ana", "ayu", "indah",
  "fitri", "fitria", "wulan", "putri", "rina", "rini", "rita", "rosa", "rosalina", "susi",
  "susan", "susanti", "tuti", "umi", "wahyuni", "wiwik", "yayuk", "yuli", "yuliana",
  "yulianti", "yuni", "yunita", "dian", "diana", "diah", "dina", "elly", "eli", "elis",
  "endah", "eny", "erna", "evi", "fani", "farah", "febrina", "fina", "gita", "hana", "hesti",
  "ika", "ina", "ira", "irma", "ismi", "jamilah", "julia", "juwita", "karina", "kartika",
  "kirana", "laila", "lestari", "lia", "lina", "lisa", "luluk", "maya", "melati", "meli",
  "mila", "mimin", "mira", "mutia", "nabila", "naila", "nani", "natasha", "neneng", "ni",
  "nia", "nike", "nila", "nina", "nita", "novi", "novita", "nurhayati", "nurul", "oktavia",
  "pipit", "puji", "putu", "rahayu", "rahmawati", "ranti", "retno", "riana", "riri", "risa",
  "riska", "rosita", "saras", "sari", "sarah", "selvi", "septi", "silvia", "sinta", "sisilia",
  "siska", "sofia", "sulastri", "tania", "tantri", "tia", "tika", "tini", "titin", "tiwi",
  "ulfa", "ulfah", "vera", "vina", "vivi", "wida", "widya", "wina", "winda", "wulandari",
  "yani", "yeni", "yenni", "yolanda", "yosi", "yulia", "yuliani", "yustika", "zahra",
  "zainab", "zulfa", "citra", "intan", "sabrina", "aisyah", "aida", "nadia", "salsabila",
]);

function firstToken(text) {
  return (text || "").trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") || "";
}

function classifyGenderFromName(nickName, name) {
  for (const tok of [firstToken(nickName), firstToken(name)]) {
    if (!tok) continue;
    if (MALE_NAMES.has(tok)) return "M";
    if (FEMALE_NAMES.has(tok)) return "F";
  }
  return null;
}

export function buildGenderData(authors) {
  const total = authors.length;
  let male = 0, female = 0;
  for (const a of authors) {
    const g = classifyGenderFromName(a.nickName, a.name);
    if (g === "M") male++;
    else if (g === "F") female++;
  }
  const classifiedCount = male + female;
  const unknown = total - classifiedCount;
  const maleRatio = classifiedCount > 0 ? male / classifiedCount : 0.5;
  const imputedMale = Math.round(unknown * maleRatio);
  const imputedFemale = unknown - imputedMale;

  return {
    genderData: [
      { name: "Laki-laki", value: male + imputedMale },
      { name: "Perempuan", value: female + imputedFemale },
    ],
    genderMeta: {
      classifiedFromNamePct: total > 0 ? Number(((classifiedCount / total) * 100).toFixed(1)) : 0,
      classifiedCount,
      imputedCount: unknown,
      method: `Kamus nama Indonesia pada nickName/name; sisanya diimputasi proporsional dari rasio M/F yang teridentifikasi (${male} M / ${female} F).`,
    },
  };
}

// Keyword wilayah -> nama kota/wilayah utk display. Cek dalam urutan ini
// (match pertama menang) supaya keyword lebih spesifik (nama kota) dicek
// sebelum keyword umum (nama provinsi).
const CITY_KEYWORD_MAP = [
  { city: "Jakarta", keywords: ["jakarta", "jaksel", "jakut", "jaktim", "jakbar", "jakpus"] },
  { city: "Surabaya", keywords: ["surabaya"] },
  { city: "Bandung", keywords: ["bandung"] },
  { city: "Medan", keywords: ["medan"] },
  { city: "Makassar", keywords: ["makassar", "ujung pandang"] },
  { city: "Semarang", keywords: ["semarang"] },
  { city: "Palembang", keywords: ["palembang"] },
  { city: "Tangerang", keywords: ["tangerang"] },
  { city: "Depok", keywords: ["depok"] },
  { city: "Bekasi", keywords: ["bekasi"] },
  { city: "Bogor", keywords: ["bogor"] },
  { city: "Yogyakarta", keywords: ["yogyakarta", "jogja", "jogjakarta"] },
  { city: "Malang", keywords: ["malang"] },
  { city: "Denpasar/Bali", keywords: ["denpasar", "bali"] },
  { city: "Batam", keywords: ["batam"] },
  { city: "Pekanbaru", keywords: ["pekanbaru"] },
  { city: "Padang", keywords: ["padang"] },
  { city: "Banjarmasin", keywords: ["banjarmasin"] },
  { city: "Pontianak", keywords: ["pontianak"] },
  { city: "Samarinda", keywords: ["samarinda"] },
  { city: "Balikpapan", keywords: ["balikpapan"] },
  { city: "Manado", keywords: ["manado"] },
  { city: "Kupang", keywords: ["kupang"] },
  { city: "Jayapura", keywords: ["jayapura"] },
  { city: "Ambon", keywords: ["ambon"] },
  { city: "Ternate", keywords: ["ternate"] },
  { city: "Mataram", keywords: ["mataram"] },
  { city: "Kendari", keywords: ["kendari"] },
  { city: "Pomalaa", keywords: ["pomalaa"] },
  { city: "Kolaka", keywords: ["kolaka"] },
  { city: "Palu", keywords: ["palu"] },
  { city: "Gorontalo", keywords: ["gorontalo"] },
  { city: "Solo/Surakarta", keywords: ["solo", "surakarta"] },
  { city: "Cirebon", keywords: ["cirebon"] },
  { city: "Sulawesi Tenggara (umum)", keywords: ["sultra", "sulawesi tenggara"] },
  { city: "Sulawesi Selatan (umum)", keywords: ["sulsel", "sulawesi selatan"] },
  { city: "Sulawesi Utara (umum)", keywords: ["sulut", "sulawesi utara"] },
  { city: "Kalimantan (umum)", keywords: ["kalimantan", "kaltim", "kalsel", "kalbar", "kalteng", "kaltara"] },
  { city: "Sumatra (umum)", keywords: ["sumatra", "sumatera"] },
  { city: "Papua (umum)", keywords: ["papua"] },
  { city: "Aceh", keywords: ["aceh"] },
  { city: "Riau", keywords: ["riau"] },
  { city: "Lampung", keywords: ["lampung"] },
  { city: "NTB", keywords: ["ntb", "nusa tenggara barat", "lombok"] },
  { city: "NTT", keywords: ["ntt", "nusa tenggara timur"] },
  { city: "Malaysia", keywords: ["malaysia"] },
];

export function buildCityData(authors) {
  const total = authors.length;
  const cityCounts = {};
  let classifiedCount = 0;
  for (const a of authors) {
    const bio = (a.signature || "").toLowerCase();
    if (!bio) continue;
    const hit = CITY_KEYWORD_MAP.find((c) => c.keywords.some((k) => bio.includes(k)));
    if (hit) {
      cityCounts[hit.city] = (cityCounts[hit.city] || 0) + 1;
      classifiedCount++;
    }
  }
  const unknown = total - classifiedCount;
  const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
  const cityData = sortedCities
    .map(([city, n]) => {
      const share = classifiedCount > 0 ? n / classifiedCount : 0;
      return { city, value: n + Math.round(unknown * share) };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    cityData,
    cityMeta: {
      classifiedFromBioPct: total > 0 ? Number(((classifiedCount / total) * 100).toFixed(1)) : 0,
      classifiedCount,
      imputedCount: unknown,
      method: `Keyword wilayah pada bio (signature); sisanya diimputasi proporsional dari distribusi kota yang teridentifikasi di ${classifiedCount} bio tsb.`,
    },
  };
}

// Distribusi TETAP (bukan hasil analisis data) — sama untuk semua subject
// karena memang tidak ada sinyal usia sama sekali. Persentase identik dengan
// yang dipakai di data/audience-followers-ajd-snapshot.js (skew 18-34 th).
const AGE_DISTRIBUTION_PCT = [
  { range: "13-17", pct: 0.08 },
  { range: "18-24", pct: 0.33 },
  { range: "25-34", pct: 0.30 },
  { range: "35-44", pct: 0.17 },
  { range: "45-54", pct: 0.08 },
  { range: "55+", pct: 0.04 },
];

export function buildAgeData(totalSampled) {
  return {
    ageData: AGE_DISTRIBUTION_PCT.map((d) => ({ range: d.range, value: Math.round(totalSampled * d.pct) })),
    ageMeta: {
      classifiedFromDataPct: 0,
      method: "TIDAK ada sinyal usia per-follower di data manapun. Angka ini adalah asumsi distribusi umum pengguna TikTok/Instagram Indonesia (skew 18-34 tahun), diterapkan rata ke semua follower — bukan estimasi individual.",
    },
  };
}
