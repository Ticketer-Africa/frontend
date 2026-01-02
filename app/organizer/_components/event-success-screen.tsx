"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto p-8 event-success-animate">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{displayMessage}</p>
        <div className="space-y-3">
          <Button
            className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href={dashboardHref}>Go to Dashboard</Link>
          </Button>
          {onCreateAnother && (
            <Button
              className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
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
