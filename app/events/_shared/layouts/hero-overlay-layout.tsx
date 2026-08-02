"use client";

import Image from "next/image";
import { useTicketSelection } from "@/app/events/_shared/use-ticket-selection";
import { useEventCheckout } from "@/app/events/_shared/use-event-checkout";
import { TicketCategoryCardV2 } from "@/app/events/[slug]/_components/ticket-category-card";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { Button } from "@/components/ui/button";

interface Props {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

export function HeroOverlayLayout({ event, mode }: Props) {
  const selection = useTicketSelection(event.ticketCategories, event.id);
  const { handleCheckout } = useEventCheckout(
    event,
    mode,
    selection,
    event.ticketCategories,
  );
  const eventDate = new Date(event.date);

  return (
    <div className="home-theme min-h-screen" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="relative h-[420px] w-full overflow-hidden">
        <Image src={event.bannerUrl} alt={event.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 container mx-auto px-4">
          <span
            className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: "var(--home-highlight-yellow)", color: "#111" }}
          >
            {event.category}
          </span>
          <h1 className="text-4xl font-bold text-white">{event.name}</h1>
          <p className="text-white/80 mt-2">
            {eventDate.toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {" · "}
            {eventDate.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
            {" · "}{event.venueName}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--home-text)" }}>About This Event</h2>
            <p style={{ color: "var(--home-muted)" }}>{event.description}</p>
          </section>

          {event.lineup.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--home-text)" }}>Lineup</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          )}

          {event.faq.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {event.faq.map((item, i) => (
                  <div key={i}>
                    <p className="font-medium" style={{ color: "var(--home-text)" }}>{item.question}</p>
                    <p className="text-sm mt-1" style={{ color: "var(--home-muted)" }}>{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-5 space-y-4 h-fit lg:sticky lg:top-6">
          <div className="rounded-2xl border p-5" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>Select Tickets</h2>
            <div className="space-y-4">
              {event.ticketCategories.map((category) => (
                <TicketCategoryCardV2
                  key={category.id}
                  category={category}
                  isSelected={selection.selected.has(category.id)}
                  quantity={selection.quantities[category.id] ?? 0}
                  onToggle={() => selection.toggleCategory(category)}
                  onQuantityChange={(delta) =>
                    selection.updateQuantity(category.id, (q) => q + delta)
                  }
                  feeMode={event.feeMode}
                  primaryFeeBps={event.primaryFeeBps}
                />
              ))}
            </div>
            {selection.hasSelection && (
              <Button size="lg" variant="homeAccent" className="w-full mt-5" onClick={handleCheckout}>
                Buy Tickets · ₦{selection.totalAmount.toLocaleString()}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
