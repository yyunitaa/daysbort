import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/current-user";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }
  if (!user.organization_id || !user.isAdmin) {
    return NextResponse.json({ error: "Hanya admin yang bisa mengelola member." }, { status: 403 });
  }

  const { userId, role, figureIds } = await request.json();
  const targetUserId = Number(userId);
  if (!Number.isInteger(targetUserId)) {
    return NextResponse.json({ error: "Akun tidak valid." }, { status: 400 });
  }
  if (role !== "super_admin" && role !== "admin" && role !== "member") {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
  }
  if (role === "super_admin" && !user.isSuperAdmin) {
    return NextResponse.json({ error: "Hanya super admin yang bisa memberikan role super admin." }, { status: 403 });
  }
  const cleanFigureIds = Array.isArray(figureIds) ? figureIds.map(Number).filter(Number.isInteger) : [];

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT role FROM public.user_organizations WHERE user_id = $1 AND organization_id = $2`,
      [targetUserId, user.organization_id]
    );
    if (existing.rows[0]?.role === "super_admin") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Role super admin tidak bisa diubah." }, { status: 403 });
    }

    await client.query(
      `INSERT INTO public.user_organizations (user_id, organization_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, organization_id) DO UPDATE SET role = EXCLUDED.role`,
      [targetUserId, user.organization_id, role]
    );

    // Kalau akun ini belum punya organisasi aktif sama sekali, langsung
    // aktifkan yang ini supaya dia tidak diarahkan ke "buat organisasi baru".
    await client.query(
      `UPDATE public.users SET organization_id = $1 WHERE id = $2 AND organization_id IS NULL`,
      [user.organization_id, targetUserId]
    );

    // Reset figure access for this org's figures, then grant the checked ones.
    await client.query(
      `DELETE FROM public.figure_access
       WHERE user_id = $1 AND figure_id IN (SELECT id FROM public.figures WHERE organization_id = $2)`,
      [targetUserId, user.organization_id]
    );
    if (cleanFigureIds.length > 0) {
      await client.query(
        `INSERT INTO public.figure_access (user_id, figure_id)
         SELECT $1, id FROM public.figures WHERE organization_id = $2 AND id = ANY($3::int[])`,
        [targetUserId, user.organization_id, cleanFigureIds]
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "Gagal menyimpan member." }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }
  if (!user.organization_id || !user.isAdmin) {
    return NextResponse.json({ error: "Hanya admin yang bisa mengelola member." }, { status: 403 });
  }

  const userId = Number(new URL(request.url).searchParams.get("userId"));
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Akun tidak valid." }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json({ error: "Tidak bisa menghapus diri sendiri." }, { status: 400 });
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT role FROM public.user_organizations WHERE user_id = $1 AND organization_id = $2`,
      [userId, user.organization_id]
    );
    if (existing.rows[0]?.role === "super_admin") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Super admin tidak bisa dihapus." }, { status: 403 });
    }

    await client.query(
      `DELETE FROM public.figure_access
       WHERE user_id = $1 AND figure_id IN (SELECT id FROM public.figures WHERE organization_id = $2)`,
      [userId, user.organization_id]
    );
    await client.query(
      `DELETE FROM public.user_organizations WHERE user_id = $1 AND organization_id = $2`,
      [userId, user.organization_id]
    );
    await client.query(
      `UPDATE public.users SET organization_id = NULL WHERE id = $1 AND organization_id = $2`,
      [userId, user.organization_id]
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return NextResponse.json({ error: "Gagal menghapus member." }, { status: 500 });
  } finally {
    client.release();
  }
}
