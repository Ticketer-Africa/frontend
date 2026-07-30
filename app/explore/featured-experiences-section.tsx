"use client";

import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { EventV2 } from "@/types/events-v2.type";
import { formatDate } from "@/lib/helpers";
import { getTicketStats } from "./utils";

interface FeaturedExperiencesSectionProps {
  events: EventV2[];
}

/**
 * Large-format horizontal cards for a curated "Featured Experiences" row,
 * per the Explore page Figma (node 173:1268). Not wired into the page yet —
 * there's no "featured" flag on events today, so this renders whatever
 * EventV2[] it's given. Wire up once a featured-events source exists.
 */
export function FeaturedExperiencesSection({ events }: FeaturedExperiencesSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-4 mb-2">
        <h2
          className="font-['Syne'] font-bold text-3xl sm:text-[32px] tracking-[-1.2px]"
          style={{ color: "var(--home-text)" }}
        >
          Featured Experiences
        </h2>
        <span className="h-[2px] w-12 shrink-0" style={{ backgroundColor: "var(--home-text-highlight)" }} />
      </div>
      <p
        className="font-['Hanken_Grotesk'] text-base tracking-[0.5px] mb-6"
        style={{ color: "var(--home-muted)" }}
      >
        Find and book tickets for the best events happening near you across the continent.
      </p>

      <div className="flex gap-6 items-center overflow-x-auto pb-2">
        {events.map((event) => {
          const { ticketCategories } = getTicketStats(event);
          const lowestPrice = ticketCategories.length
            ? Math.min(...ticketCategories.map((t) => t.displayPrice))
            : 0;

          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="relative shrink-0 w-[320px] sm:w-[420px] lg:w-[512px] h-[640px] rounded-xl overflow-hidden group"
            >
              <Image
                src={event.bannerUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 512px, (min-width: 640px) 420px, 320px"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, var(--home-bg) 0%, transparent 50%)",
                }}
                aria-hidden="true"
              />

              <div className="absolute left-6 top-[519px] flex flex-col gap-2 max-w-[calc(100%-3rem)]">
                <span
                  className="inline-flex w-fit px-4 py-1 rounded-full font-['Hanken_Grotesk'] font-semibold text-sm"
                  style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
                >
                  {formatDate(event.date).toUpperCase()}
                </span>
                <h3
                  className="font-['Syne'] font-bold text-2xl truncate"
                  style={{ color: "var(--home-text)" }}
                >
                  {event.name}
                </h3>
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className="w-3 h-3.5 shrink-0"
                    style={{ color: "var(--home-muted)" }}
                    aria-hidden="true"
                  />
                  <span
                    className="font-['Hanken_Grotesk'] text-base truncate"
                    style={{ color: "var(--home-muted)" }}
                  >
                    {event.venueName}
                    {lowestPrice > 0 ? ` · From ${lowestPrice}` : ""}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
