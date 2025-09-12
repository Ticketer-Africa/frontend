"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/lib/auth-context";
import {
  useResaleListings,
  useBuyResaleTicket,
} from "@/services/tickets/tickets.queries";
import { BuyResaleModal } from "@/components/buy-resale-modal";
import { toast } from "sonner";
import { Ticket, TicketResale } from "@/types/tickets.type";

export default function ResalePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketResale | null>(
    null
  );
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const { user } = useAuth();
  const { data: resaleTickets, isLoading } = useResaleListings();
  const { mutateAsync: buyResaleTicket, isPending: isBuyPending } =
    useBuyResaleTicket();
  console.log(resaleTickets);

  const filteredTickets = resaleTickets?.filter(
    (ticket) =>
      ticket?.event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket?.event.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuyTicket = (ticket: TicketResale) => {
    if (!user) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
      return;
    }
    setSelectedTicket(ticket);
    setIsBuyModalOpen(true);
  };

  const handleConfirmBuy = async (ticketId: string) => {
    try {
      const response = await buyResaleTicket({ ticketIds: [ticketId] });
      window.location.href = response.checkoutUrl;
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Failed to initiate purchase");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Resale Tickets...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch available tickets
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Resale Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find tickets from verified sellers at great prices
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search resale tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1 text-green-600" />
                  <span>All sellers verified</span>
                </div>
                <div className="flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1 text-blue-600" />
                  <span>Best prices guaranteed</span>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                {filteredTickets?.length} tickets available
              </p>
            </div>
          </div>
        </motion.div>

        {/* Resale Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets?.map((ticket: Ticket, index) => {
            const originalPrice = ticket?.ticketCategory?.price ?? 0;
            const resalePrice = ticket.resalePrice || 0;
            const savings = originalPrice - resalePrice;
            const isDiscounted = resalePrice < originalPrice;

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
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
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow">
                    <div className="text-sm font-semibold text-blue-600">
                      {formatPrice(resalePrice)}
                    </div>
                    {isDiscounted && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </div>
                    )}
                  </div>

                  {/* Savings Badge */}
                  {isDiscounted && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500 text-white flex items-center">
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
                        className="bg-orange-500 text-white flex items-center"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {ticket.event.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {formatDate(ticket.event.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {ticket.event.location}
                      </span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={ticket.user.profileImage ?? undefined}
                        alt={ticket.user.name}
                      ></AvatarImage>
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {ticket.user.profileImage ||
                          ticket?.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {ticket.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Verified seller
                      </div>
                    </div>
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>

                  {/* Price Comparison */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">Resale price</span>
                      <span className="font-semibold text-blue-900">
                        {formatPrice(resalePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-600 mt-1">
                      <span>Original price</span>
                      <span className={isDiscounted ? "line-through" : ""}>
                        {formatPrice(originalPrice)}
                      </span>
                    </div>
                    {isDiscounted && (
                      <div className="text-xs text-green-600 font-medium mt-1 text-center">
                        You save {formatPrice(savings)}!
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handleBuyTicket(ticket)}
                    className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full font-semibold transition-all duration-300"
                    disabled={isBuyPending}
                  >
                    {isBuyPending ? "Processing..." : "Buy Now"}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Listed{" "}
                    {ticket?.listedAt
                      ? new Date(ticket.listedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTickets?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No resale tickets found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Check back later for new listings"}
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full bg-transparent"
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        )}

        {/* Trust & Safety Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Safe & Secure Resale
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Verified Sellers
              </h4>
              <p className="text-sm text-gray-600">
                All sellers are verified and tickets are guaranteed authentic
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Best Prices</h4>
              <p className="text-sm text-gray-600">
                Find tickets at or below face value from fans who can't attend
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Buyer Protection
              </h4>
              <p className="text-sm text-gray-600">
                Full refund if your event is cancelled or tickets are invalid
              </p>
            </div>
          </div>
        </motion.div>

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
