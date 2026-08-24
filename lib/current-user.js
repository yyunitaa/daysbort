// Server-only helper (Node runtime — uses `pg`, so not for middleware).
// Reads the session cookie and looks up the account, its active organization
// (users.organization_id) plus role in it, and every organization it's a
// member of.
import { cookies } from "next/headers";
import { getPool } from "./db";
import { SESSION_COOKIE, verifySessionCookieValue } from "./auth";

export async function getCurrentUser() {
  const cookieValue = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionCookieValue(cookieValue);
  if (!session) return null;

  const pool = getPool();
  const userResult = await pool.query(
    `SELECT u.id, u.username, u.email, u.organization_id, o.name AS organization_name, uo.role
     FROM public.users u
     LEFT JOIN public.organizations o ON o.id = u.organization_id
     LEFT JOIN public.user_organizations uo ON uo.user_id = u.id AND uo.organization_id = u.organization_id
     WHERE u.id = $1`,
    [session.userId]
  );
  const user = userResult.rows[0];
  if (!user) return null;

  const orgsResult = await pool.query(
    `SELECT o.id, o.name
     FROM public.user_organizations uo
     JOIN public.organizations o ON o.id = uo.organization_id
     WHERE uo.user_id = $1
     ORDER BY o.name`,
    [session.userId]
  );

  return {
    ...user,
    isSuperAdmin: user.role === "super_admin",
    isAdmin: user.role === "super_admin" || user.role === "admin",
    organizations: orgsResult.rows,
  };
}
