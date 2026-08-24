import { NextResponse } from "next/server";
import { getPool } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/current-user";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { organizationId } = await request.json();
  const orgId = Number(organizationId);
  if (!Number.isInteger(orgId)) {
    return NextResponse.json({ error: "organizationId tidak valid." }, { status: 400 });
  }

  const isMember = user.organizations.some((o) => o.id === orgId);
  if (!isMember) {
    return NextResponse.json({ error: "Akun ini bukan anggota organisasi tersebut." }, { status: 403 });
  }

  const pool = getPool();
  await pool.query(`UPDATE public.users SET organization_id = $1 WHERE id = $2`, [orgId, user.id]);
  return NextResponse.json({ ok: true });
}
