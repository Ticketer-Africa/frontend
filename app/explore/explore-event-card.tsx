"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HomeCard } from "@/components/home/home-card";
import { formatPrice, formatDate, formatTime } from "@/lib/helpers";
import { EventV2 } from "@/types/events-v2.type";
import { getTicketStats } from "./utils";
import { EVENT_IMAGE_WIDTH, EVENT_IMAGE_HEIGHT } from "./constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01Icon, Ticket01Icon } from "@hugeicons/core-free-icons";

interface ExploreEventCardProps {
  event: EventV2;
  isPriority?: boolean;
}

function ExploreEventCardComponent({
  event,
  isPriority = false,
}: ExploreEventCardProps) {
  const { ticketCategories, maxTickets, mintedTickets, ticketsAvailable } =
    getTicketStats(event);

  const lowestPrice = ticketCategories.length
    ? Math.min(...ticketCategories.map((t) => t.displayPrice))
    : 0;
  const priceDisplay =
    lowestPrice > 0 ? `From ${formatPrice(lowestPrice)}` : "Free";

  const isAlmostSoldOut =
    ticketsAvailable > 0 && mintedTickets / maxTickets > 0.8;

  return (
    <article className="explore-card group home-theme">
      <Link href={`/events/${event.slug}`} className="block h-full">
        <HomeCard
          tone="card"
          className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-2"
        >
          <div
            className="relative flex-shrink-0 overflow-hidden"
            style={{
              height: `${EVENT_IMAGE_HEIGHT}px`,
              minHeight: `${EVENT_IMAGE_HEIGHT}px`,
            }}
          >
            <Image
              src={event.bannerUrl || "/placeholder.svg"}
              alt={event.name}
              width={EVENT_IMAGE_WIDTH}
              height={EVENT_IMAGE_HEIGHT}
              priority={isPriority}
              loading={isPriority ? undefined : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />

            <div
              className="absolute top-4 left-4 capitalize backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: "var(--home-badge-bg)",
                color: "var(--home-text-highlight)",
              }}
            >
              {event.category}
            </div>

            {isAlmostSoldOut && (
              <div className="absolute top-12 left-4">
                <Badge variant="destructive" className="bg-red-500">
                  Almost Sold Out
                </Badge>
              </div>
            )}
          </div>

          <div className="flex justify-end px-4 -mt-4 mb-2 flex-shrink-0 relative z-10">
            <div
              className="backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold shadow-sm"
              style={{
                backgroundColor: "var(--home-accent)",
                color: "var(--home-accent-fg)",
              }}
            >
              {priceDisplay}
            </div>
          </div>

          <div className="p-4 px-6 flex flex-col flex-grow">
            <h3
              className="text-xl font-semibold transition-colors line-clamp-2 min-h-[2.5rem]"
              style={{ color: "var(--home-text)" }}
            >
              {event.name}
            </h3>

            <div
              className="space-y-1 text-sm min-h-[60px]"
              style={{ color: "var(--home-muted)" }}
            >
              <div className="flex items-center">
                <HugeiconsIcon icon={Calendar01Icon}
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {formatDate(event.date)} at {formatTime(event.date)}
                </span>
              </div>
              <div className="flex items-center">
                <HugeiconsIcon icon={Location01Icon}
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{event.venueName}</span>
              </div>
            </div>

            <div className="min-h-[56px] pb-2" style={{ color: "var(--home-muted)" }}>
              <div className="flex items-center mb-1">
                <HugeiconsIcon icon={Ticket01Icon}
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
                  </div>
                ))}
              </div>
            </div>

            <Button variant="homeAccent" size="lg" className="w-full mt-auto">
              View Details
            </Button>
          </div>
        </HomeCard>
      </Link>
    </article>
  );
}

export const ExploreEventCard = memo(ExploreEventCardComponent);
