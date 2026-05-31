"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, formatTime } from "@/lib/helpers";
import { EventV2 } from "@/types/events-v2.type";
import { getTicketStats } from "./utils";
import { EVENT_IMAGE_WIDTH, EVENT_IMAGE_HEIGHT } from "./constants";

interface ExploreEventCardProps {
  event: EventV2;
  /**
   * Priority loading - only true for first 3 cards (above the fold)
   * Performance: Ensures LCP image loads with high priority
   */
  isPriority?: boolean;
}

/**
 * ExploreEventCard - Optimized event card for the explore page
 *
 * Performance optimizations:
 * - memo() prevents re-renders when parent state changes but props don't
 * - Explicit image dimensions prevent CLS (Cumulative Layout Shift)
 * - Priority loading only for above-the-fold images
 * - No framer-motion animations on individual cards (moved to CSS)
 * - Minimal inline calculations
 */
function ExploreEventCardComponent({
  event,
  isPriority = false,
}: ExploreEventCardProps) {
  const { ticketCategories, maxTickets, mintedTickets, ticketsAvailable } =
    getTicketStats(event);

  // Calculate price display once
  const lowestPrice = ticketCategories.length
    ? Math.min(...ticketCategories.map((t) => t.displayPrice))
    : 0;
  const priceDisplay =
    lowestPrice > 0 ? `From ${formatPrice(lowestPrice)}` : "Free";

  // Pre-calculate sold-out status
  const isAlmostSoldOut =
    ticketsAvailable > 0 && mintedTickets / maxTickets > 0.8;

  return (
    <article
      className="explore-card group"
      /**
       * CSS animations via class instead of JS framer-motion
       * Performance: CSS animations are GPU-accelerated and don't block main thread
       */
    >
      <Link href={`/events/${event.slug}`} className="block h-full">
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
          {/*
           * Image container with fixed aspect ratio
           * CRITICAL FOR CLS: The wrapper has explicit dimensions so space is reserved
           * before image loads, preventing layout shift
           */}
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{
              /**
               * Reserve exact space for image to prevent CLS
               * height: 192px matches h-48 Tailwind class
               */
              height: `${EVENT_IMAGE_HEIGHT}px`,
              minHeight: `${EVENT_IMAGE_HEIGHT}px`,
            }}
          >
            <Image
              src={event.bannerUrl || "/placeholder.svg"}
              alt={event.name}
              width={EVENT_IMAGE_WIDTH}
              height={EVENT_IMAGE_HEIGHT}
              /**
               * Only first 3 cards get priority loading (above the fold)
               * Others use lazy loading to reduce initial bandwidth
               */
              priority={isPriority}
              loading={isPriority ? undefined : "lazy"}
              /**
               * sizes attribute helps browser choose optimal image size
               * Prevents downloading unnecessarily large images
               */
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              /**
               * placeholder="blur" would be ideal but requires static import
               * For dynamic images, we use a background color as placeholder
               */
            />

            {/* Category badge - positioned absolutely, won't cause layout shift */}
            <div className="absolute top-4 left-4 capitalize bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-[#1E88E5]">
              {event.category}
            </div>

            {/* Almost sold out badge - conditionally rendered but absolutely positioned */}
            {isAlmostSoldOut && (
              <div className="absolute top-12 left-4">
                <Badge variant="destructive" className="bg-red-500">
                  Almost Sold Out
                </Badge>
              </div>
            )}
          </div>

          {/* Price badge - absolutely positioned relative to card, not image */}
          <div className="flex justify-end px-4 -mt-4 mb-2 flex-shrink-0 relative z-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-[#1E88E5] shadow-sm">
              {priceDisplay}
            </div>
          </div>

          {/*
           * Content section with minimum heights to prevent CLS
           * Each section has min-height to reserve space for varying content lengths
           */}
          <div className="p-4 px-6 flex flex-col flex-grow">
            {/* Event title - min-height ensures consistent card heights */}
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#1E88E5] transition-colors line-clamp-2 min-h-[2.5rem]">
              {event.name}
            </h3>

            {/* Date & Location - fixed height section */}
            <div className="space-y-1 text-gray-600 text-sm min-h-[60px]">
              <div className="flex items-center">
                <Calendar
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {formatDate(event.date)} at {formatTime(event.date)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>

            {/* Tickets section - fixed height to prevent shifts */}
            <div className="text-gray-600 pb-2">
              <div className="flex items-center mb-1">
                <Ticket
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">Ticket Options</span>
              </div>
              <div className="space-y-2">
                {ticketCategories.slice(0, 1).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="line-clamp-1">
                      {ticket.name} (
                      {ticket.displayPrice === 0 ? "Free" : formatPrice(ticket.displayPrice)})
                    </span>
                    <span
                      className={
                        ticket.maxTickets - ticket.minted < 5
                          ? "text-red-500 font-medium"
                          : "text-gray-600"
                      }
                    >
                      {ticket.maxTickets - ticket.minted} of {ticket.maxTickets}{" "}
                      available
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* View details button */}
            <Button
              size="lg"
              className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full font-semibold mt-auto"
            >
              View Details
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * memo() prevents re-renders when parent updates filters but this card's event hasn't changed
 * This is crucial for explore page where many cards exist and filters change frequently
 */
export const ExploreEventCard = memo(ExploreEventCardComponent);
