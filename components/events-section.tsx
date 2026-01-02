"use client";

import { memo } from "react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAllEvents } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
import { truncateText } from "@/utils/trauncate";
import { Button } from "@/components/ui/button";

/**
 * EventCard - Memoized to prevent unnecessary re-renders
 *
 * Performance optimizations:
 * - Explicit image dimensions prevent CLS (224px = h-56)
 * - priority={true} for first card (likely LCP element)
 * - CSS animations instead of framer-motion
 */
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
  return (
    <article
      onClick={onClick}
      className="cursor-pointer group section-animate"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        {/* Full-card background image */}
        <Image
          src={event.bannerUrl || "/placeholder.svg"}
          alt={event.name}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Text content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-lg font-semibold group-hover:text-blue-300 transition-colors line-clamp-2 mb-2">
            {event.name}
          </h3>

          <p className="text-gray-200 text-sm line-clamp-2 mb-3">
            {truncateText(event.description, 10)}
          </p>

          <div className="flex items-center text-gray-200 text-sm">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">
              {truncateText(event.location, 5)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

/**
 * EventsSection - Homepage upcoming events
 *
 * Performance optimizations:
 * 1. Removed framer-motion - uses CSS animations
 * 2. Memoized EventCard component
 * 3. Explicit image dimensions for CLS prevention
 * 4. Lazy loading for non-critical images
 */
export function EventsSection() {
  const router = useRouter();
  const { data: response } = useAllEvents();

  // Handle both array and paginated response formats
  const events: Event[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  const handleEventClick = (slug: string) => {
    router.push(`/events/${slug}`);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section header - CSS animation */}
        <div className="section-animate text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing events happening near you.
          </p>
        </div>

        {/* Events grid with staggered CSS animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {events.slice(0, 3).map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center section-animate section-delay-4">
          <Button
            size="lg"
            onClick={() => router.push("/explore")}
            className="bg-[#1E88E5] hover:bg-blue-500 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore More Events
          </Button>
        </div>
      </div>
    </section>
  );
}
