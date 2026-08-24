import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "../../../../lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const { username, email, password } = await request.json();

  if (
    typeof username !== "string" || !username.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof password !== "string" || !password
  ) {
    return NextResponse.json({ error: "Username, email, dan password wajib diisi." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const pool = getPool();

  try {
    await pool.query(
      `INSERT INTO public.users (username, email, password_hash) VALUES ($1, $2, $3)`,
      [cleanUsername, cleanEmail, passwordHash]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 });
  }
}
