"use client";

import Image from "next/image";
import { useTicketSelection } from "@/app/events/_shared/use-ticket-selection";
import { useEventCheckout } from "@/app/events/_shared/use-event-checkout";
import { Button } from "@/components/ui/button";
import { EventLayoutViewModel } from "@/types/event-layout.type";

interface Props {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

export function TimelineLayout({ event, mode }: Props) {
  const selection = useTicketSelection(event.ticketCategories);
  const { handleCheckout } = useEventCheckout(
    event,
    mode,
    selection,
    event.ticketCategories,
  );
  const fromPrice = Math.min(...event.ticketCategories.map((c) => c.displayPrice));
  const eventDate = new Date(event.date);

  return (
    <div className="home-theme min-h-screen pt-16 pb-28" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="relative h-[360px] w-full overflow-hidden">
        <Image src={event.bannerUrl} alt={event.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 container mx-auto px-4">
          <span
            className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: "var(--home-highlight-yellow)", color: "#111" }}
          >
            {event.category}
          </span>
          <h1 className="text-4xl font-bold text-white">{event.name}</h1>
          <p className="text-white/80 mt-2">
            {eventDate.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
            {" · "}{event.venueName}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>Full Show Timeline</h2>
            <ol className="space-y-4">
              {event.timelineSlots.map((slot, i) => (
                <li key={i} className="flex gap-4 items-baseline">
                  <span data-testid="timeline-slot-time" className="font-semibold w-20 shrink-0" style={{ color: "var(--home-accent)" }}>
                    {slot.time}
                  </span>
                  <div>
                    <p className="text-xs uppercase" style={{ color: "var(--home-muted)" }}>{slot.stage}</p>
                    <p className="font-medium" style={{ color: "var(--home-text)" }}>{slot.performer}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>Lineup</h2>
            <div className="grid grid-cols-2 gap-3">
              {event.lineup.map((artist) => (
                <div
                  key={artist}
                  className="rounded-xl border px-4 py-3 text-center font-medium"
                  style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)", color: "var(--home-text)" }}
                >
                  {artist}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 border-t backdrop-blur-xl"
        style={{ backgroundColor: "rgba(11,14,20,0.95)", borderColor: "var(--home-border)" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs" style={{ color: "var(--home-muted)" }}>Tickets from</p>
            <p className="text-xl font-bold" style={{ color: "var(--home-text)" }}>₦{fromPrice.toLocaleString()}</p>
          </div>
          <Button size="lg" variant="homeAccent" onClick={handleCheckout}>
            Buy Tickets
          </Button>
        </div>
      </div>
    </div>
  );
}
