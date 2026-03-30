import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const routeWithQuery = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const isOrganizerPath = path.startsWith("/organizer");

  // Skip login page and Next.js internals
  if (path.startsWith("/login") || path.startsWith("/_next")) {
    return NextResponse.next();
  }

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Grab the ticketer_sid cookie from the incoming request
    const cookies = req.cookies.get("ticketer_sid")?.value;

    console.log("==========================================");
    console.log("🔍 MIDDLEWARE DEBUGGING");
    console.log("Path:", path);
    console.log("API Base:", apiBase);
    console.log("Has ticketer_sid?", !!cookies);

    // Forward ticketer_sid explicitly to backend
    const res = await fetch(`${apiBase}/v1/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Cookie: cookies ? `ticketer_sid=${cookies}` : "",
      },
    });

    console.log("Response Status:", res.status);
    console.log("Response OK:", res.ok);
    console.log("Response Status Text:", res.statusText);

    // Parse JSON if 200
    if (res.status === 200 || res.status === 304) {
      let userData;
      if (res.status === 200) {
        userData = await res.json();
      } else {
        // Optionally handle 304 using cached data if needed
        userData = {}; // minimal object just to allow access
      }

      const userRole = res.status === 200 ? userData?.user?.role : undefined;
      if (isOrganizerPath && res.status === 200 && userRole !== "ORGANIZER") {
        return NextResponse.redirect(new URL("/explore", req.url));
      }

      console.log("✅ User authenticated - allowing access", userData);
      return NextResponse.next();
    }

    console.log("❌ User not authenticated - redirecting to login");
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", routeWithQuery);
    if (isOrganizerPath) {
      loginUrl.searchParams.set("intent", "organizer");
    }
    return NextResponse.redirect(loginUrl);
  } catch (err) {
    console.error("Middleware error:", err);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", routeWithQuery);
    if (isOrganizerPath) {
      loginUrl.searchParams.set("intent", "organizer");
    }
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
