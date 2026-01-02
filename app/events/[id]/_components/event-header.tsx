"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/helpers";

interface Event {
  title: string;
  bannerUrl?: string;
  isVerified?: boolean;
  category: string;
  date: Date | string;
  time?: string;
  location: string;
}

/**
 * Loading skeleton for event page
 */
export function EventPageSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-t-transparent border-[#1E88E5] rounded-full animate-spin" />
        <p className="text-gray-600">Loading event details...</p>
      </div>
    </div>
  );
}

/**
 * Not found state for event page
 */
export function EventNotFound() {
  return (
    <div className="py-16 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎭</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Event not found
        </h1>
        <p className="text-gray-600 mb-6">
          The event you're looking for doesn't exist.
        </p>
        <Link href="/explore">
          <Button className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full">
            Browse Events
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Event header with banner image
 */
export function EventHeader({ event }: { event: Event }) {
  return (
    <section className="relative">
      <div className="h-64 md:h-96 overflow-hidden">
        <img
          src={event.bannerUrl || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="container mx-auto">
          <div className="flex items-center space-x-2 mb-2">
            {event.isVerified && (
              <Badge variant="success" className="bg-green-500">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant="secondary">{event.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.time && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Back to events button
 */
export function BackButton() {
  return (
    <div className="py-4">
      <Button variant="ghost" asChild>
        <Link href="/explore">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>
    </div>
  );
}
