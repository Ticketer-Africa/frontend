"use client";

import Image from "next/image";
import { TicketCategoryCardV2 } from "@/app/events/[slug]/_components/ticket-category-card";
import { useTicketSelection } from "@/app/events/_shared/use-ticket-selection";
import { useEventCheckout } from "@/app/events/_shared/use-event-checkout";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { Button } from "@/components/ui/button";

interface Props {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

export function TicketFirstLayout({ event, mode }: Props) {
  const selection = useTicketSelection(event.ticketCategories);
  const { handleCheckout } = useEventCheckout(
    event,
    mode,
    selection,
    event.ticketCategories,
  );
  const eventDate = new Date(event.date);

  return (
    <div className="home-theme min-h-screen pt-16" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="container mx-auto px-4 pt-8 pb-8 max-w-3xl">
        <div className="relative h-[260px] w-full rounded-2xl overflow-hidden">
          <Image src={event.bannerUrl} alt={event.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-8 right-8">
            <span
              className="inline-block text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-2"
              style={{ backgroundColor: "var(--home-highlight-yellow)", color: "#111" }}
            >
              {event.category}
            </span>
            <h1 className="text-2xl font-bold text-white">
              {event.name} · {eventDate.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}, {event.venueName}
            </h1>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
            Select Your Tickets
          </h2>
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
            <Button size="lg" variant="homeAccent" className="w-full mt-6" onClick={handleCheckout}>
              Buy Tickets · ₦{selection.totalAmount.toLocaleString()}
            </Button>
          )}
        </section>

        {event.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>
              FAQ
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
    </div>
  );
}
