"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

// Mirrors components/layout/header.tsx's DARK_ROUTES: only the auth pages and
// the resale marketplace among the routes that use RouteLoader are dark-theme,
// everything else (My Tickets, Organizer, Wallet, Settings, etc.) stays light.
const DARK_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/resale",
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
  const isDark = DARK_ROUTES.includes(pathname);

  return (
    <div
      className={clsx(
        "section-animate fixed inset-0 flex items-center justify-center z-50",
        isDark ? "home-theme" : "bg-gray-50 bg-opacity-90"
      )}
      style={isDark ? { backgroundColor: "var(--home-bg)", opacity: 0.9 } : undefined}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: isDark ? "var(--home-accent)" : "#1E88E5" }}
        ></div>
      </div>
    </div>
  );
}
