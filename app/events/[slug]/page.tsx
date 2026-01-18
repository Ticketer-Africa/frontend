/**
 * Event Page V2 - Redesigned
 * Displays event details and ticket categories with improved layout and animations
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";
import { EventV2, TicketCategoryV2 } from "@/types/events-v2.type";
import { EventHeaderV2 } from "./_components/event-header";
import { TicketCategoryCardV2 } from "./_components/ticket-category-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, Shield, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface EventPageProps {
  params: { slug: string };
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: event, isLoading, error } = useEventBySlugV2(params.slug);

  const [selectedCategories, setSelectedCategories] = useState<
    TicketCategoryV2[]
  >([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleSelectCategory = (category: TicketCategoryV2) => {
    setSelectedCategories((prev) =>
      prev.some((cat) => cat.id === category.id)
        ? prev.filter((cat) => cat.id !== category.id)
        : [...prev, category],
    );

    if (!quantities[category.id]) {
      setQuantities((prev) => ({
        ...prev,
        [category.id]: 1,
      }));
    }
  };

  const handleQuantityChange = (categoryId: string, newQuantity: number) => {
    const category = event?.ticketCategories.find((c) => c.id === categoryId);
    if (!category) return;

    const maxAvailable = category.maxTickets - category.minted;
    const limitedQuantity = Math.max(1, Math.min(newQuantity, maxAvailable));

    setQuantities((prev) => ({
      ...prev,
      [categoryId]: limitedQuantity,
    }));
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one ticket category.");
      return;
    }

    // Prepare checkout data
    const checkoutData = selectedCategories.map((cat) => ({
      ticketCategoryId: cat.id,
      quantity: quantities[cat.id] || 1,
      ticketCategoryName: cat.name,
      price: cat.price,
    }));

    // Store in session for checkout page
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        eventId: event!.id,
        eventName: event!.name,
        tickets: checkoutData,
      }),
    );

    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Event Not Found</span>
            </div>
            <p className="text-muted-foreground text-sm">
              We couldn't find the event you're looking for. It may have been
              removed or the link might be incorrect.
            </p>
            <Button
              onClick={() => router.push("/explore")}
              className="w-full mt-4"
            >
              Browse Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuantity = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = selectedCategories.reduce((sum, cat) => {
    const qty = quantities[cat.id] || 0;
    return sum + cat.displayPrice * qty;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Event Header */}
      <EventHeaderV2 event={event} />

      {/* Event Details Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="event-card-animate">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Organizer Info */}
              <div className="event-card-animate event-card-delay-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Organizer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={event.organizer.profileImage ?? undefined}
                          alt={event.organizer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
                          {event.organizer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {event.organizer.name}
                          </h3>
                          {/* {event.organizer.isVerified && (
                            <Shield className="h-4 w-4 text-green-500" />
                          )} */}
                        </div>
                        <p className="text-sm text-gray-600">Event Organizer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ticket Categories */}
              <div className="event-sidebar-animate">
                <Card className="sticky top-4 space-y-4 p-4">
                  <CardHeader>
                    <CardTitle>Get Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.ticketCategories?.length > 0 ? (
                      event.ticketCategories.map((category) => (
                        <div key={category.id} className="space-y-4">
                          <TicketCategoryCardV2
                            category={category}
                            onSelectCategory={handleSelectCategory}
                            isSelected={selectedCategories.some(
                              (c) => c.id === category.id,
                            )}
                            feeMode={event.feeMode}
                            primaryFeeBps={event.primaryFeeBps}
                          />

                          {/* Quantity Selector */}
                          {selectedCategories.some(
                            (c) => c.id === category.id,
                          ) && (
                            <div className="p-4 bg-secondary rounded-lg border border-border">
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Quantity
                              </label>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      category.id,
                                      (quantities[category.id] || 1) - 1,
                                    )
                                  }
                                  className="w-10 h-10 flex items-center justify-center border border-border rounded-md hover:bg-accent"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={category.maxTickets - category.minted}
                                  value={quantities[category.id] || 1}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      category.id,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  className="w-16 text-center border border-border rounded-md px-2 py-1"
                                />
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      category.id,
                                      (quantities[category.id] || 1) + 1,
                                    )
                                  }
                                  className="w-10 h-10 flex items-center justify-center border border-border rounded-md hover:bg-accent"
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Max available:{" "}
                                {category.maxTickets - category.minted}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">
                        No tickets available for this event.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              {selectedCategories.length > 0 && (
                <div className="event-sidebar-animate event-sidebar-delay-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex justify-between text-sm pb-2 border-b border-border"
                        >
                          <span className="text-muted-foreground">
                            {cat.name} × {quantities[cat.id] || 1}
                          </span>
                          <span className="font-medium">
                            ₦
                            {(
                              cat.displayPrice * (quantities[cat.id] || 1)
                            ).toLocaleString()}
                          </span>
                        </div>
                      ))}

                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal
                          </span>
                          <span>₦{totalPrice.toLocaleString()}</span>
                        </div>
                        {event.feeMode === "ATTENDEE" && (
                          <div className="flex justify-between text-sm text-yellow-700 bg-yellow-50/50 p-2 rounded">
                            <span>Includes fees</span>
                            <span>
                              ₦
                              {Math.floor(
                                (totalPrice * (event.primaryFeeBps + 150)) /
                                  10000 -
                                  totalPrice,
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                          <span>Total</span>
                          <span>₦{totalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleProceedToCheckout}
                        size="lg"
                        className="w-full"
                      >
                        Proceed to Checkout ({totalQuantity}{" "}
                        {totalQuantity === 1 ? "ticket" : "tickets"})
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Event Stats */}
              <div className="event-sidebar-animate event-sidebar-delay-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Attendees</span>
                      </div>
                      <span className="font-medium">
                        {event.ticketCategories?.reduce(
                          (total, cat) => total + cat.minted,
                          0,
                        ) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
