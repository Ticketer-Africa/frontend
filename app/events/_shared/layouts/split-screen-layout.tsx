"use client";

import { useState } from "react";
import Image from "next/image";
import { useTicketSelection } from "@/app/events/_shared/use-ticket-selection";
import { useEventCheckout } from "@/app/events/_shared/use-event-checkout";
import { Button } from "@/components/ui/button";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { cn } from "@/lib/utils";

interface Props {
  event: EventLayoutViewModel;
  mode: "live" | "preview";
}

const TABS = ["Overview", "Lineup", "Location"] as const;

export function SplitScreenLayout({ event, mode }: Props) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Overview");
  const selection = useTicketSelection(event.ticketCategories);
  const { handleCheckout } = useEventCheckout(
    event,
    mode,
    selection,
    event.ticketCategories,
  );

  return (
    <div className="home-theme min-h-screen pt-16 grid grid-cols-1 lg:grid-cols-2" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="relative h-64 lg:h-auto">
        <Image src={event.bannerUrl} alt={event.name} fill className="object-cover" priority />
      </div>

      <div className="p-6 lg:p-10 flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--home-accent)" }}>
          {event.category}
        </p>
        <h1 className="text-3xl font-bold mt-1" style={{ color: "var(--home-text)" }}>{event.name}</h1>
        <p className="mt-2" style={{ color: "var(--home-muted)" }}>{event.venueName}</p>

        <div role="tablist" className="flex gap-2 mt-6 border-b" style={{ borderColor: "var(--home-border)" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              )}
              style={{
                borderColor: activeTab === tab ? "var(--home-accent)" : "transparent",
                color: activeTab === tab ? "var(--home-text)" : "var(--home-muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === "Overview" && (
            <p style={{ color: "var(--home-muted)" }}>{event.description}</p>
          )}
          {activeTab === "Lineup" && (
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
          )}
          {activeTab === "Location" && (
            <div style={{ color: "var(--home-muted)" }}>
              <p className="font-medium" style={{ color: "var(--home-text)" }}>{event.venueName}</p>
              <p>{event.venueAddress}</p>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t space-y-3" style={{ borderColor: "var(--home-border)" }}>
          {event.ticketCategories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <span style={{ color: "var(--home-text)" }}>{category.name}</span>
              <span className="font-semibold" style={{ color: "var(--home-text)" }}>
                ₦{category.displayPrice.toLocaleString()}
              </span>
            </div>
          ))}
          <Button size="lg" variant="homeAccent" className="w-full" onClick={handleCheckout}>
            Buy Tickets
          </Button>
          <div className="flex items-center gap-4 text-xs pt-1" style={{ color: "var(--home-muted)" }}>
            <span>Verified Organizer</span>
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
