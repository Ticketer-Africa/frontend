"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEventBySlug } from "@/services/events/events.queries";
import {
  useBuyResaleTicket,
  useResaleListings,
} from "@/services/tickets/tickets.queries";
import { useAuth } from "@/lib/auth-context";
import { TicketPurchaseModal } from "@/components/ticket-purchase-modal";
import { TicketResale } from "@/types/tickets.type";
import { toast } from "sonner";
import { BuyResaleModal } from "@/components/buy-resale-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EventStructuredData,
  BreadcrumbStructuredData,
} from "@/components/structured-data";

import {
  TicketCategory,
  ResaleTicketCard,
  TicketCategoryCard,
} from "./_components/ticket-cards";
import {
  EventPageSkeleton,
  EventNotFound,
  EventHeader,
  BackButton,
} from "./_components/event-header";
import { FloatingCart } from "./_components/floating-cart";

export default function EventPage({ params }: { params: { id: string } }) {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const [selectedResaleTicket, setSelectedResaleTicket] =
    useState<TicketResale | null>(null);
  const [selectedTicketCategories, setSelectedTicketCategories] = useState<
    TicketCategory[]
  >([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { user } = useAuth();
  const { data: event, isLoading, error } = useEventBySlug(params.id);
  const { data: resaleTickets = [] } = useResaleListings(event?.id);
  const { mutateAsync: buyResaleTicket, isPending: isBuyPending } =
    useBuyResaleTicket();

  // Debug logging
  useEffect(() => {
    if (error) {
      toast.error(
        "Failed to load event: " + (error.message || "Unknown error")
      );
    }
  }, [error]);

  /**
   * Performance: useCallback prevents function recreation on each render
   */
  const handleSelectCategory = useCallback((category: TicketCategory) => {
    setSelectedTicketCategories((prev) =>
      prev.some((cat) => cat.id === category.id) ? prev : [...prev, category]
    );
    setQuantities((prev) => ({
      ...prev,
      [category.id]: prev[category.id] || 1,
    }));
  }, []);

  const handleRemoveCategory = useCallback((categoryId: string) => {
    setSelectedTicketCategories((prev) =>
      prev.filter((cat) => cat.id !== categoryId)
    );
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[categoryId];
      return newQuantities;
    });
  }, []);

  const handleBuyResaleTicket = useCallback(
    (ticket: TicketResale) => {
      if (!user) {
        window.location.href = `/login?returnUrl=${encodeURIComponent(
          window.location.href
        )}`;
        return;
      }
      setSelectedResaleTicket(ticket);
      setIsResaleModalOpen(true);
    },
    [user]
  );

  const handleConfirmBuy = useCallback(
    async (ticketId: string) => {
      try {
        const response = await buyResaleTicket({ ticketIds: [ticketId] });
        window.location.href = response.checkoutUrl;
      } catch (error: any) {
        toast.error(error?.message || "Failed to initiate purchase");
      }
    },
    [buyResaleTicket]
  );

  const handleBuyTickets = useCallback(() => {
    if (!user) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
      return;
    }
    if (selectedTicketCategories.length === 0) {
      toast.error("Please select at least one ticket category.");
      return;
    }
    setSelectedResaleTicket(null);
    setIsPurchaseModalOpen(true);
  }, [user, selectedTicketCategories.length]);

  const handleClearCart = useCallback(() => {
    setSelectedTicketCategories([]);
    setQuantities({});
  }, []);

  const handleCloseModals = useCallback(() => {
    setIsPurchaseModalOpen(false);
    setSelectedResaleTicket(null);
    setSelectedTicketCategories([]);
    setQuantities({});
  }, []);

  const handleCloseResaleModal = useCallback(() => {
    setIsResaleModalOpen(false);
    setSelectedResaleTicket(null);
  }, []);

  if (isLoading) {
    return <EventPageSkeleton />;
  }

  if (!event || error) {
    return <EventNotFound />;
  }

  return (
    <div>
      {/* Structured Data for SEO */}
      <EventStructuredData event={event} />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://ticketer.africa" },
          { name: "Events", url: "https://ticketer.africa/explore" },
          {
            name: event.title,
            url: `https://ticketer.africa/events/${event.slug}`,
          },
        ]}
      />

      <BackButton />
      <EventHeader event={event} />

      {/* Event Details */}
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
                          src={event?.organizer?.profileImage ?? undefined}
                          alt={event?.organizer?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
                          {event?.organizer?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">
                            {event?.organizer?.name || "Unknown Organizer"}
                          </h3>
                          {event.isVerified && (
                            <Shield className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Event Organizer</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resale Tickets */}
              {resaleTickets.length > 0 && (
                <div className="event-card-animate event-card-delay-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets for Resale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {resaleTickets.map((ticket) => (
                          <ResaleTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onBuy={handleBuyResaleTicket}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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
                      event.ticketCategories.map(
                        (ticketCategory: TicketCategory) => (
                          <TicketCategoryCard
                            key={ticketCategory.id}
                            ticketCategory={ticketCategory}
                            isSelected={selectedTicketCategories.some(
                              (cat) => cat.id === ticketCategory.id
                            )}
                            onSelect={handleSelectCategory}
                            onRemove={handleRemoveCategory}
                          />
                        )
                      )
                    ) : (
                      <p className="text-gray-600">
                        No tickets available for this event.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

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
                          (total: number, cat: TicketCategory) =>
                            total + cat.minted,
                          0
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

      {/* Floating Cart */}
      <FloatingCart
        selectedCategories={selectedTicketCategories}
        quantities={quantities}
        onClearCart={handleClearCart}
        onCheckout={handleBuyTickets}
      />

      {/* Purchase Modal */}
      <TicketPurchaseModal
        event={event}
        ticketCategories={selectedTicketCategories}
        resaleTicket={selectedResaleTicket}
        isOpen={isPurchaseModalOpen}
        onClose={handleCloseModals}
        quantities={quantities}
        setQuantities={setQuantities}
      />

      {/* Resale Purchase Modal */}
      <BuyResaleModal
        isOpen={isResaleModalOpen}
        onClose={handleCloseResaleModal}
        selectedTicket={selectedResaleTicket}
        onConfirmBuy={handleConfirmBuy}
        isPending={isBuyPending}
        isAuthenticated={!!user}
      />
    </div>
  );
}
