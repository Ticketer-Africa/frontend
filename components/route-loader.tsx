"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

const DARK_ROUTES = [
  "/",
  "/explore",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/resale",
  "/for-organisers",
];

/**
 * RouteLoader - Optimized for performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion - CSS animation instead
 * 2. Uses section-animate class from globals.css
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const isHome =
    DARK_ROUTES.includes(pathname) ||
    pathname.startsWith("/events/") ||
    pathname.startsWith("/resale/") ||
    pathname.startsWith("/ticket/") ||
    pathname.startsWith("/organizer/") ||
    [
      "/organizer",
      "/wallet",
      "/settings",
      "/verify-otp",
      "/verify-ticket",
      "/terms",
      "/service-agreement",
    ].includes(pathname);

  return (
    <div
      className={clsx(
        "section-animate fixed inset-0 flex items-center justify-center z-50",
        isHome ? "home-theme" : "bg-gray-50 bg-opacity-90"
      )}
      style={isHome ? { backgroundColor: "var(--home-bg)", opacity: 0.9 } : undefined}
    >
      <div className="text-center" role="status">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: isHome ? "var(--home-accent)" : "#1E88E5" }}
        ></div>
        <span className="sr-only">Loading page...</span>
      </div>
    </div>
  );
}
