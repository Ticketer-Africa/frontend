"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeCard } from "@/components/home/home-card";
import {
  Calendar,
  MapPin,
  Search,
  TrendingDown,
  TrendingUp,
  User,
  Shield,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/helpers";
import { useUser } from "@/lib/auth-context";
import {
  useResaleListings,
  useBuyResaleTicket,
} from "@/services/tickets/tickets.queries";
import { BuyResaleModal } from "@/components/buy-resale-modal";
import { BuyResalePayload, TicketResale } from "@/types/tickets.type";

export default function ResalePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketResale | null>(
    null,
  );
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { user } = useUser();
  const { data: resaleTickets, isLoading } = useResaleListings();
  const { mutateAsync: buyResaleTicket, isPending: isBuyPending } =
    useBuyResaleTicket();

  const filteredTickets = resaleTickets?.filter(
    (ticket) =>
      ticket?.event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket?.event.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleBuyTicket = (ticket: TicketResale) => {
    setSelectedTicket(ticket);
    setIsBuyModalOpen(true);
  };
  const handleConfirmBuy = async (payload: BuyResalePayload) => {
    try {
      const response = await buyResaleTicket(payload);
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch {
      // The ticket service shows the API error toast.
    }
  };

  if (isLoading) {
    return (
      <div
        className="home-theme min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--home-accent)" }}
          ></div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--home-text)" }}
          >
            Loading Resale Tickets...
          </h2>
          <p style={{ color: "var(--home-muted)" }}>
            Please wait while we fetch available tickets
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Resale Marketplace
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Find tickets from verified sellers at great prices
          </p>
          <Button asChild variant="homeAccent" className="mt-6 px-6">
            <Link href="/resale/list">List a ticket</Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div
            className="rounded-2xl p-6 border"
            style={{
              backgroundColor: "var(--home-card)",
              borderColor: "var(--home-border)",
            }}
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--home-text-highlight)" }}
                aria-hidden="true"
              />
              <Input
                type="text"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full"
                style={{
                  backgroundColor: "var(--home-bg)",
                  borderColor: "var(--home-border-strong)",
                  color: "var(--home-text)",
                }}
                aria-label="Search events"
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div
                className="flex items-center space-x-4 text-sm"
                style={{ color: "var(--home-muted)" }}
              >
                <div className="flex items-center">
                  <Shield
                    className="w-4 h-4 mr-1"
                    style={{ color: "var(--home-success)" }}
                  />
                  <span>All sellers verified</span>
                </div>
                <div className="flex items-center">
                  <TrendingDown
                    className="w-4 h-4 mr-1"
                    style={{ color: "var(--home-text-highlight)" }}
                  />
                  <span>Best prices guaranteed</span>
                </div>
              </div>

              <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                {filteredTickets?.length} tickets available
              </p>
            </div>
          </div>
        </div>

        {/* Resale Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets?.map((ticket: TicketResale) => {
            const originalPrice = ticket?.ticketCategory?.price ?? 0;
            const resalePrice = ticket.resalePrice || 0;
            const savings = originalPrice - resalePrice;
            const isDiscounted = resalePrice < originalPrice;

            return (
              <HomeCard
                key={ticket.id}
                tone="card"
                className="overflow-hidden transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <Image
                    src={ticket.event.bannerUrl || "/placeholder.svg"}
                    alt={ticket.event.name}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />

                  {/* Price Badge */}
                  <div className="absolute top-3 right-3">
                    <div
                      className="rounded-full px-3 py-1 shadow text-center backdrop-blur-sm"
                      style={{ backgroundColor: "var(--home-badge-bg)" }}
                    >
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--home-text-highlight)" }}
                      >
                        {formatPrice(resalePrice)}
                      </div>
                      {isDiscounted && (
                        <div
                          className="text-xs line-through"
                          style={{ color: "var(--home-muted-dim)" }}
                        >
                          {formatPrice(originalPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Savings Badge */}
                  {isDiscounted && (
                    <div className="absolute top-4 left-4">
                      <Badge
                        className="flex items-center"
                        style={{
                          backgroundColor: "var(--home-success)",
                          color: "var(--home-success-fg)",
                        }}
                      >
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Save {formatPrice(savings)}
                      </Badge>
                    </div>
                  )}

                  {/* Premium Badge */}
                  {!isDiscounted && resalePrice > originalPrice && (
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant="secondary"
                        className="flex items-center"
                        style={{
                          backgroundColor: "var(--home-highlight-yellow)",
                          color: "var(--home-bg)",
                        }}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3
                    className="text-xl font-semibold mb-3 line-clamp-2"
                    style={{ color: "var(--home-text)" }}
                  >
                    {ticket.event.name}
                  </h3>

                  <div
                    className="space-y-2 mb-4 min-h-[60px]"
                    style={{ color: "var(--home-muted)" }}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {formatDate(ticket.event.date)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {ticket.event.location}
                      </span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div
                    className="flex items-center space-x-3 mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: "var(--home-card-elevated)" }}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={ticket.user.profileImage ?? undefined}
                        alt={ticket.user.name}
                      ></AvatarImage>
                      <AvatarFallback
                        className="text-sm"
                        style={{
                          backgroundColor: "var(--home-card-highlight)",
                          color: "var(--home-text-highlight)",
                        }}
                      >
                        {ticket.user.profileImage ||
                          ticket?.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--home-text)" }}
                      >
                        {ticket.user.name}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--home-muted)" }}
                      >
                        Verified seller
                      </div>
                    </div>
                    <Shield
                      className="w-4 h-4"
                      style={{ color: "var(--home-success)" }}
                    />
                  </div>

                  {/* Price Comparison */}
                  <div
                    className="rounded-lg p-3 mb-4"
                    style={{ backgroundColor: "var(--home-card-highlight)" }}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span style={{ color: "var(--home-muted)" }}>
                        Resale price
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--home-text)" }}
                      >
                        {formatPrice(resalePrice)}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between text-xs mt-1"
                      style={{ color: "var(--home-muted-dim)" }}
                    >
                      <span>Original price</span>
                      <span className={isDiscounted ? "line-through" : ""}>
                        {formatPrice(originalPrice)}
                      </span>
                    </div>
                    {isDiscounted && (
                      <div
                        className="text-xs font-medium mt-1 text-center"
                        style={{ color: "var(--home-success-text)" }}
                      >
                        You save {formatPrice(savings)}!
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleBuyTicket(ticket)}
                    variant="homeAccent"
                    className="w-full"
                    disabled={isBuyPending}
                  >
                    {isBuyPending ? "Processing..." : "Buy Now"}
                  </Button>
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: "var(--home-muted-dim)" }}
                  >
                    Listed{" "}
                    {ticket?.listedAt
                      ? new Date(ticket.listedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </HomeCard>
            );
          })}
        </div>

        {filteredTickets?.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4" aria-hidden="true">
              🎫
            </div>
            <h3
              className="text-2xl font-semibold mb-2"
              style={{ color: "var(--home-text)" }}
            >
              No resale tickets found
            </h3>
            <p className="mb-6" style={{ color: "var(--home-muted)" }}>
              {searchQuery
                ? "Try adjusting your search"
                : "Check back later for new listings"}
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                variant="homeOutline"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Trust & Safety Info */}
        <HomeCard tone="card" className="mt-16 p-8">
          <h3
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: "var(--home-text)" }}
          >
            Safe & Secure Resale
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--home-card-elevated)" }}
              >
                <Shield
                  className="w-6 h-6"
                  style={{ color: "var(--home-success)" }}
                />
              </div>
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--home-text)" }}
              >
                Verified Sellers
              </h4>
              <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                All sellers are verified and tickets are guaranteed authentic
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--home-card-elevated)" }}
              >
                <TrendingDown
                  className="w-6 h-6"
                  style={{ color: "var(--home-text-highlight)" }}
                />
              </div>
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--home-text)" }}
              >
                Best Prices
              </h4>
              <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                Find tickets at or below face value from fans who can't attend
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "var(--home-card-elevated)" }}
              >
                <User
                  className="w-6 h-6"
                  style={{ color: "var(--home-text-highlight)" }}
                />
              </div>
              <h4
                className="font-semibold mb-2"
                style={{ color: "var(--home-text)" }}
              >
                Buyer Protection
              </h4>
              <p className="text-sm" style={{ color: "var(--home-muted)" }}>
                Full refund if your event is cancelled or tickets are invalid
              </p>
            </div>
          </div>
        </HomeCard>

        <BuyResaleModal
          isOpen={isBuyModalOpen}
          onClose={() => {
            setIsBuyModalOpen(false);
            setSelectedTicket(null);
          }}
          selectedTicket={selectedTicket}
          onConfirmBuy={handleConfirmBuy}
          isPending={isBuyPending}
          isAuthenticated={!!user}
        />
      </div>
    </div>
  );
}
