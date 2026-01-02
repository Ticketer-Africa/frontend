"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Loading spinner for my-tickets page
 */
export function MyTicketsLoading() {
  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50 section-animate">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1E88E5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your session
        </p>
      </div>
    </div>
  );
}

/**
 * Empty state when user has no tickets
 */
export function EmptyTicketsState() {
  return (
    <div className="text-center py-12 section-animate">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No tickets yet
      </h3>
      <p className="text-gray-600 mb-6">
        You haven't purchased any tickets yet. Start exploring events!
      </p>
      <Button
        asChild
        className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Link href="/explore">Explore Events</Link>
      </Button>
    </div>
  );
}

/**
 * Page header with ticket count
 */
export function MyTicketsHeader({ totalTickets }: { totalTickets: number }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          My Tickets
        </h1>
        <p className="text-gray-600 mt-1">Manage your event tickets</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-sm text-gray-600">Total Tickets</p>
        <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
      </div>
    </div>
  );
}

/**
 * Animated background circles
 */
export function BackgroundCircles() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="my-tickets-bg-circle absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      <div className="my-tickets-bg-circle-alt absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
    </div>
  );
}
