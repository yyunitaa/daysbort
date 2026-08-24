import { NextResponse } from "next/server";
import { getPool } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/current-user";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }
  if (!user.organization_id) {
    return NextResponse.json({ error: "Akun belum tergabung dalam organisasi." }, { status: 409 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: "Hanya admin yang bisa menambah figur." }, { status: 403 });
  }

  const { name, title } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nama figur wajib diisi." }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO public.figures (organization_id, name, title) VALUES ($1, $2, $3) RETURNING id`,
    [user.organization_id, name.trim(), typeof title === "string" && title.trim() ? title.trim() : null]
  );
  const figureId = result.rows[0].id;

  // Admin (bukan super_admin) tetap dibatasi checklist untuk figur lain, tapi
  // otomatis dapat akses ke figur yang baru saja dia buat sendiri.
  if (!user.isSuperAdmin) {
    await pool.query(
      `INSERT INTO public.figure_access (user_id, figure_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [user.id, figureId]
    );
  }

  return NextResponse.json({ ok: true, figureId });
}
