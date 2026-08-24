// Bentuk kosong dari data/audience-followers-snapshot.js — lihat
// data/empty/ajd-snapshot.js. `totalSampled: 1` (bukan 0) sengaja dipakai
// supaya pembagian persentase di AudienceTab tidak menghasilkan NaN;
// hasilnya tetap 0% karena semua pembilangnya 0.

export const meta = {
  actor: null,
  targetHandle: null,
  pulledAt: null,
  costUsd: 0,
  apifyRunId: null,
};

export const genderData = [];

export const genderMeta = {
  classifiedFromNamePct: 0,
  classifiedCount: 0,
  imputedCount: 0,
  method: null,
};

export const cityData = [];

export const cityMeta = {
  classifiedFromBioPct: 0,
  classifiedCount: 0,
  imputedCount: 0,
  method: null,
};

export const ageData = [];

export const ageMeta = {
  classifiedFromDataPct: 0,
  method: null,
};

export const followerOverview = {
  totalSampled: 1,
  verifiedPct: 0,
  privateAccountPct: 0,
  hasBioPct: 0,
  avgFans: 0,
  avgFollowing: 0,
  medianFans: 0,
  maxFans: 0,
};

export const followerTiers = [];

export const followerLocationSignal = {
  localMentioned: 0,
  otherCityMentioned: 0,
  noLocationInfo: 0,
  topLocalKeywords: [],
};

export const topInfluentialFollowers = [];
