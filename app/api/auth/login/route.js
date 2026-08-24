import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPool } from "../../../../lib/db";
import { createSessionCookieValue, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "../../../../lib/auth";

export async function POST(request) {
  const { email, password } = await request.json();

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `SELECT id, password_hash FROM public.users WHERE email = $1`,
    [email.trim().toLowerCase()]
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionCookieValue(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
