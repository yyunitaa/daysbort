import { NextResponse } from "next/server";
import { getPool } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/current-user";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }
  if (!user.organization_id || !user.isAdmin) {
    return NextResponse.json({ error: "Hanya admin yang bisa menambahkan member." }, { status: 403 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email || !email.trim()) {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, username, email FROM public.users WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  const found = result.rows[0];
  if (!found) {
    return NextResponse.json({ found: false });
  }

  const membership = await pool.query(
    `SELECT role FROM public.user_organizations WHERE user_id = $1 AND organization_id = $2`,
    [found.id, user.organization_id]
  );
  const figureAccess = await pool.query(
    `SELECT figure_id FROM public.figure_access WHERE user_id = $1
     AND figure_id IN (SELECT id FROM public.figures WHERE organization_id = $2)`,
    [found.id, user.organization_id]
  );

  return NextResponse.json({
    found: true,
    user: { id: found.id, username: found.username, email: found.email },
    existingRole: membership.rows[0]?.role || null,
    existingFigureIds: figureAccess.rows.map((r) => r.figure_id),
  });
}
