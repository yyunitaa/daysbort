// Now that dashboard data is queried live (lib/live-data.js) against the
// warehouse instead of static per-subject snapshot files, any subject_id
// can resolve — a figure "has real data" simply if it's been linked to one
// at all (an unlinked/typo'd subject_id just comes back with zeroed/empty
// results from the live queries, which reads the same as "no data").
export function hasRealData(subjectId) {
  return Boolean(subjectId);
}

// The "Kabupaten Kolaka" regency tab only makes sense for AJD (Bupati
// Kolaka) — other subjects (e.g. ARR/Bulog) don't have a regency.
export function showsRegencyTab(subjectId) {
  return subjectId === "AJD";
}
