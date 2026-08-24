// Server-only. Looks up a figure and enforces per-member figure access:
// super_admin bypasses entirely (every figure in the org); admin and member
// both need an explicit public.figure_access grant (see
// app/api/members/route.js) — the difference between them is only in what
// the figures LIST shows (see app/organization/figures/page.js), not in this
// access check.
import { getPool } from "./db";

export async function getAccessibleFigure(user, figureId) {
  if (!user?.organization_id || !Number.isInteger(figureId)) return null;

  const pool = getPool();
  const query = user.isSuperAdmin
    ? {
        text: `SELECT id, name, title, subject_id FROM public.figures WHERE id = $1 AND organization_id = $2`,
        values: [figureId, user.organization_id],
      }
    : {
        text: `SELECT f.id, f.name, f.title, f.subject_id FROM public.figures f
               JOIN public.figure_access fa ON fa.figure_id = f.id AND fa.user_id = $3
               WHERE f.id = $1 AND f.organization_id = $2`,
        values: [figureId, user.organization_id, user.id],
      };
  const result = await pool.query(query.text, query.values);
  return result.rows[0] || null;
}

// Just the figures a user can actually enter (no "greyed out" ones) — used
// for compact pickers like the dashboard header's figure switcher.
export async function getAccessibleFigures(user) {
  if (!user?.organization_id) return [];

  const pool = getPool();
  const query = user.isSuperAdmin
    ? {
        text: `SELECT id, name, title FROM public.figures WHERE organization_id = $1 ORDER BY name`,
        values: [user.organization_id],
      }
    : {
        text: `SELECT f.id, f.name, f.title FROM public.figures f
               JOIN public.figure_access fa ON fa.figure_id = f.id AND fa.user_id = $2
               WHERE f.organization_id = $1 ORDER BY f.name`,
        values: [user.organization_id, user.id],
      };
  const result = await pool.query(query.text, query.values);
  return result.rows;
}
