// Server-only helper. Reads the `current_figure_id` cookie set by
// middleware.js whenever a /dashboard/[figureId] route is visited, and
// resolves it through the same access rule as getAccessibleFigure (admins
// see any figure in their org; members only ones granted to them).
import { cookies } from "next/headers";
import { getAccessibleFigure } from "./figure-access";

export async function getCurrentFigure(user) {
  const raw = cookies().get("current_figure_id")?.value;
  const figureId = Number(raw);
  if (!Number.isInteger(figureId)) return null;
  return getAccessibleFigure(user, figureId);
}
