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

    const cookieHeader = req.headers.get("cookie") || "";

    console.log("==========================================");
    console.log("🔍 MIDDLEWARE DEBUGGING");
    console.log("Path:", path);
    console.log("API Base:", apiBase);
    console.log("Cookie Header:", cookieHeader);
    console.log("Has ticketer_sid?", cookieHeader.includes("ticketer_sid"));

    const res = await fetch(`${apiBase}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });

    console.log("Response Status:", res.status);
    console.log("Response OK:", res.ok);
    console.log("Response Status Text:", res.statusText);

    // Try to read the response body for more info
    const responseText = await res.text();
    console.log("Response Body:", responseText);

    // Check the exact condition
    console.log("Status === 200?", res.status === 200);
    console.log("Status type:", typeof res.status);

    if (res.status === 200) {
      console.log("✅ User authenticated - allowing access");
      return NextResponse.next();
    }

    console.log("❌ User not authenticated - redirecting to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);

    return NextResponse.redirect(loginUrl);
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
