import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip login page itself or static files
  if (path.startsWith("/login") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

    const res = await fetch(`${apiBase}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (res.status === 200) {
      // User is logged in, let them pass
      return NextResponse.next();
    }

    // Not logged in → redirect to login with original path
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path); // <-- add the path
    // return NextResponse.redirect(loginUrl);
  } catch (err) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/ticket/:path*",
    "/wallet/:path*",
    "/my-tickets/:path*",
    "/settings/:path*",
    "/verify-ticket/:path*",
    "/organizer/:path*",
  ],
};
