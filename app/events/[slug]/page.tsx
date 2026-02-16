/**
 * Event Page V3 - Modern Clean Design (2025 Standards)
 * Mobile-first • Clean typography • Better buttons • Floating mobile CTA • Subtle shadows & borders
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";
import { EventV2, TicketCategoryV2 } from "@/types/events-v2.type";
import { EventHeaderV2 } from "./_components/event-header"; // updated version below
import { TicketCategoryCardV2 } from "./_components/ticket-category-card"; // improved version below
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, ShoppingBag, Ticket } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: event, isLoading, error } = useEventBySlugV2(params.slug);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

    const max = category.maxTickets - category.minted;
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = typeof value === "function" ? value(current) : value;
      return {
        ...prev,
        [id]: Math.max(1, Math.min(max, next)),
      };
    });
  };

  const handleCheckout = () => {
    if (!user) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    if (selected.size === 0) {
      toast.error("Please select at least one ticket type");
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            onClick={handleCheckout}
            disabled={!hasSelection}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Checkout
          </Button>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-32 md:pb-0">
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

          {/* Hero */}
          <EventHeaderV2 event={event} />

          <main className="py-10 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10">
              {/* Main content */}
              <div className="lg:col-span-8 space-y-12 lg:space-y-16">
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
                  <div className="flex items-center gap-4 p-6 rounded-2xl border bg-card/50 backdrop-blur-sm">
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

                <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="Attendees"
                    value={
                      event.ticketCategories?.reduce(
                        (a, b) => a + b.minted,
                        0,
                      ) ?? 0
                    }
                    icon={<Ticket className="h-5 w-5" />}
                  />
                  {/* Add more stats if you have data */}
                </section>
              </div>

              {/* Tickets column */}
              <div className="lg:col-span-4 lg:sticky lg:top-6 h-fit space-y-6">
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b bg-muted/30">
                    <h2 className="text-xl font-bold tracking-tight">
                      Tickets
                    </h2>
                  </div>

                  <div className="p-5 space-y-4">
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

                      <Button
                        size="lg"
                        className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white"
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

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card/50 p-5 text-center">
      <div className="text-muted-foreground mb-1.5 text-sm font-medium">
        {label}
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
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
