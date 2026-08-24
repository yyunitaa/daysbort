import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionCookieValue } from "./lib/auth";

export async function middleware(request) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionCookieValue(cookie);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Remembers the last figure visited so sidebar links (Report, Dashboard
  // submenu) from other pages know which figure to go back to instead of
  // bouncing to the figure picker.
  const dashboardMatch = request.nextUrl.pathname.match(/^\/dashboard\/(\d+)/);
  if (dashboardMatch) {
    response.cookies.set("current_figure_id", dashboardMatch[1], {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/welcome",
    "/organization/:path*",
    "/dashboard/:path*",
    "/report/:path*",
    "/member/:path*",
    "/settings/:path*",
  ],
};
