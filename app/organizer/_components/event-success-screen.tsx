"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";

interface SuccessScreenProps {
  eventName: string;
  title?: string;
  message?: string;
  onCreateAnother?: () => void;
  dashboardHref?: string;
}

/**
 * Success screen shown after event creation/update
 */
export function EventSuccessScreen({
  eventName,
  title = "Event Created!",
  message,
  onCreateAnother,
  dashboardHref = "/organizer",
}: SuccessScreenProps) {
  const displayMessage =
    message || `Your event "${eventName}" has been successfully created.`;

  return (
    <div
      className="home-theme min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="text-center max-w-md mx-auto p-8 event-success-animate">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "rgba(66,167,59,0.1)" }}
        >
          <HugeiconsIcon icon={Tick01Icon} className="h-10 w-10" style={{ color: "var(--home-success)" }} />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
          {title}
        </h1>
        <p className="mb-6" style={{ color: "var(--home-muted)" }}>
          {displayMessage}
        </p>
        <div className="space-y-3">
          <Button
            className="w-full rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:opacity-90"
            style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
            asChild
          >
            <Link href={dashboardHref}>Go to Dashboard</Link>
          </Button>
          {onCreateAnother && (
            <Button
              className="w-full rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150 hover:opacity-90"
              style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
              onClick={onCreateAnother}
            >
              Create Another Event
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
