"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

/**
 * Loading screen for auth/data fetching
 */
export function LoadingScreen({
  message = "Loading...",
  subMessage = "Please wait",
}: LoadingScreenProps) {
  return (
    <div
      className="home-theme fixed inset-0 flex items-center justify-center z-50 loading-screen-animate"
      style={{ backgroundColor: "var(--home-bg)", opacity: 0.9 }}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--home-accent)" }}
        ></div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--home-text)" }}>
          {message}
        </h2>
        <p style={{ color: "var(--home-muted)" }}>{subMessage}</p>
      </div>
    </div>
  );
}

interface ErrorScreenProps {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * Error screen for failed data fetching
 */
export function ErrorScreen({
  title = "Error",
  message = "Something went wrong. Please try again later.",
  backHref = "/organizer",
  backLabel = "Back to Dashboard",
}: ErrorScreenProps) {
  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="text-center max-w-md mx-auto p-8 error-screen-animate">
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
          {title}
        </h1>
        <p className="mb-6" style={{ color: "var(--home-muted)" }}>
          {message}
        </p>
        <Button
          className="rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
          style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
          asChild
        >
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
