/**
 * Event Page V3 - Modern Clean Design (2025 Standards)
 * Mobile-first • Clean typography • Better buttons • Floating mobile CTA • Subtle shadows & borders
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth-context";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";
import { EventV2, EventOccurrence, TicketCategoryV2 } from "@/types/events-v2.type";
import { EventHeaderV2 } from "./_components/event-header"; // updated version below
import { TicketCategoryCardV2 } from "./_components/ticket-category-card"; // improved version below
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, ShoppingBag, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useUser();
  const { data: event, isLoading, error } = useEventBySlugV2(params.slug);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);

  const toggleCategory = (category: TicketCategoryV2) => {
    const id = category.id;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!quantities[id]) {
          setQuantities((q) => ({ ...q, [id]: 1 }));
        }
      }
      return next;
    });
  };

  const updateQuantity = (
    id: string,
    value: number | ((prev: number) => number),
  ) => {
    const category = event?.ticketCategories.find((c) => c.id === id);
    if (!category) return;

    const max = Math.min(category.maxTickets - (category.minted ?? 0), 10); // Max 10 per category
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = typeof value === "function" ? value(current) : value;

      // Check total across all categories
      const otherTotal = Object.entries(prev)
        .filter(([key]) => key !== id)
        .reduce((sum, [, qty]) => sum + qty, 0);

      if (otherTotal + next > 10) {
        toast.error("Maximum 10 tickets per purchase");
        return prev;
      }

      return {
        ...prev,
        [id]: Math.max(1, Math.min(max, next)),
      };
    });
  };

  const handleCheckout = () => {
    if (selected.size === 0) {
      toast.error("Please select at least one ticket type");
      return;
    }

    const activeOccurrences = event!.isRecurring
      ? (event!.occurrences ?? []).filter((o) => o.isActive)
      : [];
    const isRecurring = activeOccurrences.length > 0;
    if (isRecurring && !selectedOccurrenceId) {
      toast.error("Please select a date to continue");
      return;
    }

    const checkoutItems = Array.from(selected).map((id) => {
      const cat = event!.ticketCategories.find((c) => c.id === id)!;
      return {
        ticketCategoryId: id,
        quantity: quantities[id] ?? 1,
        ticketCategoryName: cat.name,
        price: cat.price,
      };
    });

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        eventId: event!.id,
        eventName: event!.name,
        tickets: checkoutItems,
        occurrenceId: selectedOccurrenceId ?? undefined,
        customFields: event!.customFields ?? [],
      }),
    );

    router.push("/checkout");
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error || !event) return <NotFound router={router} />;

  const totalTickets = Array.from(selected).reduce(
    (sum, id) => sum + (quantities[id] ?? 1),
    0,
  );
  const totalAmount = Array.from(selected).reduce((sum, id) => {
    const cat = event.ticketCategories.find((c) => c.id === id)!;
    return sum + cat.displayPrice * (quantities[id] ?? 1);
  }, 0);

  const hasSelection = totalTickets > 0;

  return (
    <>
      {/* Mobile sticky bottom bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          hasSelection ? "translate-y-0 shadow-2xl" : "translate-y-full",
        )}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
            </p>
            <p className="text-xl font-bold tracking-tight">
              ₦{totalAmount.toLocaleString()}
            </p>
          </div>
          <Button
            size="lg"
            variant="primary"
            className="flex-1"
            onClick={handleCheckout}
            disabled={!hasSelection}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Checkout
          </Button>
        </div>
      </div>

      <div className="min-h-screen bg-background pb-32 md:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="pt-5 pb-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-3"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <main className="py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
              {/* Main content */}
              <div className="lg:col-span-6 space-y-8 lg:space-y-12">
                <EventHeaderV2 event={event} />

                <section>
                  <h2 className="text-2xl font-bold tracking-tight mb-5">
                    About the Event
                  </h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed">
                    {event.description.split("\n").map((p, i) => (
                      <p key={i} className="mb-4 last:mb-0">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold tracking-tight mb-5">
                    Organizer
                  </h2>
                  <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card">
                    <div className="shrink-0">
                      <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-background shadow-sm">
                        {event.organizer.profileImage ? (
                          <img
                            src={event.organizer.profileImage}
                            alt={event.organizer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl">
                            {event.organizer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {event.organizer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Event Organizer
                      </p>
                    </div>
                  </div>
                </section>


              </div>

              {/* Poster + tickets column */}
              <div className="lg:col-span-6 lg:-mt-16 lg:sticky lg:top-6 h-fit space-y-6">
                <div className="rounded-2xl border bg-card overflow-hidden">
                  <div className="relative aspect-[3/4] bg-muted">
                    {event.bannerUrl ? (
                      <Image
                        src={event.bannerUrl}
                        alt={event.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                        Event poster
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border bg-card overflow-hidden">
                  <div className="px-6 py-5 border-b bg-muted/30">
                    <h2 className="text-xl font-bold tracking-tight">
                      Tickets
                    </h2>
                  </div>

                  <div className="p-5 space-y-4">
                    {event.isRecurring && (event.occurrences ?? []).some((o) => o.isActive) && (
                      <OccurrenceSelector
                        occurrences={event.occurrences!}
                        selectedId={selectedOccurrenceId}
                        onSelect={setSelectedOccurrenceId}
                      />
                    )}

                    <div
                      className={cn(
                        "space-y-4 transition-all duration-200",
                        event.isRecurring &&
                        (event.occurrences ?? []).some((o) => o.isActive) &&
                        !selectedOccurrenceId
                          ? "opacity-40 blur-[1px] pointer-events-none"
                          : "",
                      )}
                    >
                      {event.ticketCategories?.length ? (
                        event.ticketCategories.map((cat) => (
                          <TicketCategoryCardV2
                            key={cat.id}
                            category={cat}
                            isSelected={selected.has(cat.id)}
                            quantity={quantities[cat.id] ?? 0}
                            onToggle={() => toggleCategory(cat)}
                            onQuantityChange={(delta: number) =>
                              updateQuantity(cat.id, (q) => q + delta)
                            }
                            feeMode={event.feeMode}
                            primaryFeeBps={event.primaryFeeBps}
                          />
                        ))
                      ) : (
                        <div className="py-10 text-center text-muted-foreground">
                          No tickets available yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desktop order summary */}
                  {hasSelection && (
                    <div className="p-6 border-t bg-muted/20">
                      <h3 className="font-semibold mb-4">Order Summary</h3>

                      <div className="space-y-3 mb-6 text-sm">
                        {Array.from(selected).map((id) => {
                          const cat = event.ticketCategories.find(
                            (c) => c.id === id,
                          )!;
                          const qty = quantities[id] ?? 1;
                          return (
                            <div key={id} className="flex justify-between">
                              <span className="text-muted-foreground">
                                {cat.name} × {qty}
                              </span>
                              <span className="font-medium">
                                ₦{(cat.displayPrice * qty).toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center py-4 border-t font-bold text-lg">
                        <span>Total</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-muted/40 border border-border rounded-lg p-3 mt-4">
                        <p className="text-xs text-muted-foreground">
                          <strong>Note:</strong> Maximum of 10 tickets per
                          purchase. Tickets are non-refundable once purchased.
                        </p>
                      </div>

                      <Button
                        size="lg"
                        variant="primary"
                        className="w-full mt-5"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────
// Helper Components
// ────────────────────────────────────────────────


function OccurrenceSelector({
  occurrences,
  selectedId,
  onSelect,
}: {
  occurrences: EventOccurrence[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const active = occurrences.filter((o) => o.isActive);
  if (!active.length) return null;

  return (
    <div className="rounded-xl border bg-amber-50 border-amber-200 p-4">
      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-3">
        Pick a date to unlock tickets
      </p>
      <div className="flex flex-wrap gap-2">
        {active.map((o) => {
          const date = new Date(o.startsAt);
          const label = date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
          const sublabel = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
          const isSelected = o.id === selectedId;
          return (
            <button
              key={o.id}
              onClick={() => onSelect(o.id)}
              className={cn(
                "flex flex-col items-center px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                isSelected
                  ? "border-2 border-[#1E88E5] bg-blue-50 text-[#1E88E5]"
                  : "border border-border bg-background text-foreground hover:border-[#1E88E5]",
              )}
              title={`${sublabel}${o.locationOverride ? " · " + o.locationOverride : ""}`}
            >
              {label}
              <span className="text-[10px] font-normal opacity-70">{sublabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-72 w-full rounded-2xl mb-10" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-10">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <Skeleton className="lg:col-span-4 h-[600px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function NotFound({ router }: { router: any }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-2xl font-bold">Event not found</h2>
        <p className="mt-3 text-muted-foreground">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button className="mt-8 w-full" onClick={() => router.push("/explore")}>
          Discover Events
        </Button>
      </div>
    </div>
  );
}
