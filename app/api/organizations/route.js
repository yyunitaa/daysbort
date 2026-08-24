import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/current-user";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { name } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nama organisasi wajib diisi." }, { status: 400 });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const org = await client.query(
      `INSERT INTO public.organizations (name) VALUES ($1) RETURNING id`,
      [name.trim()]
    );
    const orgId = org.rows[0].id;
    await client.query(
      `INSERT INTO public.user_organizations (user_id, organization_id, role) VALUES ($1, $2, 'super_admin')`,
      [user.id, orgId]
    );
    // Organisasi yang baru dibuat langsung jadi organisasi aktif.
    await client.query(`UPDATE public.users SET organization_id = $1 WHERE id = $2`, [orgId, user.id]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, organizationId: orgId });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return NextResponse.json({ error: "Nama organisasi sudah dipakai." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Gagal membuat organisasi." }, { status: 500 });
  } finally {
    client.release();
  }
}
