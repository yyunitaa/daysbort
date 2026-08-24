// Bentuk kosong dari data/ajd-snapshot.js — dipakai untuk figur yang belum
// tersambung ke data nyata (lihat components/DashboardShell.jsx, isRealData).
// Sengaja sama persis strukturnya (nama field & bentuk) supaya tab-tab bisa
// menampilkan menu/chart yang sama walau datanya kosong.

export const snapshotMeta = {
  subjectId: null,
  subjectName: null,
  subjectTitle: null,
  queryDate: null,
  source: null,
};

export const kpi = {
  relevantMentions: 0,
  rawMentions: 0,
  positivePct: 0,
  netSentiment: "0.0",
};

export const attributionData = [];

export const platformData = [];

export const audienceSegmentData = [];

export const sentimentTrend = [];

export const volumeTrend = [];

export const topicEngagement = [];

export const topTopicsVolume = [];

export const riskRadar = {
  topicLabel: null,
  categoryLabel: null,
  nNegativeLast7d: 0,
  nNegativePrior7d: 0,
  delta7d: 0,
  isTrueVelocity: false,
  caveat: null,
};

export const topContent = [];
