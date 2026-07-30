"use client";

import Image from "next/image";
import Link from "next/link";
import { useTicketSelection } from "@/app/events/_shared/use-ticket-selection";
import { useEventCheckout } from "@/app/events/_shared/use-event-checkout";
import { Button } from "@/components/ui/button";
import { EventLayoutViewModel } from "@/types/event-layout.type";

interface Props {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

export function EditorialLayout({ event, mode }: Props) {
  const selection = useTicketSelection(event.ticketCategories);
  const { handleCheckout } = useEventCheckout(
    event,
    mode,
    selection,
    event.ticketCategories,
  );
  const eventDate = new Date(event.date);
  const fromPrice = Math.min(...event.ticketCategories.map((c) => c.displayPrice));

  return (
    <div className="home-theme min-h-screen pt-16" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--home-accent)" }}>
            {event.category}
          </p>
          <h1 className="text-4xl font-bold mt-2" style={{ color: "var(--home-text)" }}>{event.name}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--home-muted)" }}>
            {eventDate.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
            {" · "}{event.venueName}{" · "}Presented by {event.organizerName}
          </p>

          <div className="relative h-72 w-full rounded-2xl overflow-hidden my-6">
            <Image src={event.bannerUrl} alt={event.name} fill className="object-cover" />
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--home-text)" }}>The Experience</h2>
          <p style={{ color: "var(--home-muted)" }}>{event.description}</p>

          {event.pullQuote && (
            <blockquote
              className="my-8 text-2xl font-semibold italic border-l-4 pl-6"
              style={{ borderColor: "var(--home-accent)", color: "var(--home-text)" }}
            >
              &ldquo;{event.pullQuote}&rdquo;
            </blockquote>
          )}

          {event.goodToKnow.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-3" style={{ color: "var(--home-text)" }}>Good To Know</h2>
              <ul className="space-y-2 list-disc list-inside" style={{ color: "var(--home-muted)" }}>
                {event.goodToKnow.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}

          {event.relatedEvents.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold mb-4" style={{ color: "var(--home-text)" }}>You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {event.relatedEvents.map((related) => (
                  <Link
                    key={related.id}
                    href={`/events/${related.slug}`}
                    className="rounded-xl border overflow-hidden block"
                    style={{ borderColor: "var(--home-border)" }}
                  >
                    <div className="relative h-28">
                      <Image src={related.bannerUrl} alt={related.name} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase" style={{ color: "var(--home-accent)" }}>{related.category}</p>
                      <p className="font-medium" style={{ color: "var(--home-text)" }}>{related.name}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--home-muted)" }}>From ₦{related.fromPrice.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:col-span-4 h-fit lg:sticky lg:top-6">
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--home-border)", backgroundColor: "var(--home-card)" }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--home-muted)" }}>Venue</span>
              <span style={{ color: "var(--home-text)" }}>{event.venueName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--home-muted)" }}>Date</span>
              <span style={{ color: "var(--home-text)" }}>
                {eventDate.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            {event.doorsOpenAt && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--home-muted)" }}>Doors</span>
                <span style={{ color: "var(--home-text)" }}>
                  {new Date(event.doorsOpenAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--home-muted)" }}>From</span>
              <span className="font-semibold" style={{ color: "var(--home-text)" }}>₦{fromPrice.toLocaleString()}</span>
            </div>
            <Button size="lg" variant="homeAccent" className="w-full mt-2" onClick={handleCheckout}>
              Buy Tickets
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
