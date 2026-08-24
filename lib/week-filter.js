// Trend data in the snapshots is bucketed by ISO week with labels like
// "29 Jun" (see scripts/export-*.mjs `fmtWeek`) — no raw date field. This
// parses that label back into a real Date (assuming the snapshot's year,
// 2026) so the date-range filter in DashboardShell can work against it.
const MONTHS_ID = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 };

export function parseWeekLabel(label, year = 2026) {
  const [day, mon] = label.split(" ");
  return new Date(year, MONTHS_ID[mon] ?? 0, Number(day));
}

export function isWeekInRange(label, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const d = parseWeekLabel(label);
  if (startDate && d < new Date(startDate)) return false;
  if (endDate && d > new Date(endDate)) return false;
  return true;
}

export function isPlatformMatch(itemPlatform, selectedPlatform) {
  return !selectedPlatform || selectedPlatform === "Semua Platform" || itemPlatform === selectedPlatform;
}
