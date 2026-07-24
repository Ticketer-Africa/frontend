"use client";

import { memo } from "react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAllEvents } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
import { truncateText } from "@/utils/trauncate";

interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
}

const EventCard = memo(function EventCard({
  event,
  index,
  onClick,
}: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      onClick={onClick}
      className="cursor-pointer group section-animate"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-[514px] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
        <Image
          src={event.bannerUrl || "/placeholder.svg"}
          alt={event.name}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--home-bg) 0%, rgba(11,14,20,0) 50%)",
          }}
        />

        <div className="absolute bottom-6 left-6 right-6">
          <h3
            className="font-['Syne'] font-bold text-2xl sm:text-[32px] mb-2 line-clamp-2"
            style={{ color: "var(--home-text)" }}
          >
            {truncateText(event.name, 8)}
          </h3>

          <div
            className="flex items-center gap-3 text-base font-['Hanken_Grotesk'] font-semibold"
            style={{ color: "var(--home-text)" }}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
});

export function EventsSection() {
  const router = useRouter();
  const { data: response } = useAllEvents();

  const events: Event[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  const handleEventClick = (slug: string) => {
    router.push(`/events/${slug}`);
  };

  return (
    <section
      className="home-theme py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-animate flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2
              className="font-['Syne'] font-bold text-3xl sm:text-[32px] tracking-[-1.2px]"
              style={{ color: "var(--home-text)" }}
            >
              Trending Events
            </h2>
            <span
              className="hidden sm:block w-12 h-[2px]"
              style={{ backgroundColor: "var(--home-text-highlight)" }}
              aria-hidden="true"
            />
          </div>
          <Link
            href="/explore"
            className="font-['Hanken_Grotesk'] text-base font-semibold border-b pb-1.5"
            style={{ color: "var(--home-text-highlight)", borderColor: "var(--home-text-highlight)" }}
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
