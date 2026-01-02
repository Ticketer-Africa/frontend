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
    <div className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50 loading-screen-animate">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
        <p className="text-gray-600">{subMessage}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto p-8 error-screen-animate">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button
          className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          asChild
        >
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
