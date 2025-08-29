"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ResaleModal } from "@/components/resale-modal";
import {
  useMyTickets,
  useListResale,
} from "@/services/tickets/tickets.queries";
import { Ticket, ListResalePayload } from "@/types/tickets.type";
import { formatDate, formatPrice } from "@/lib/dummy-data";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const { data: userTickets } = useMyTickets();
  const { mutateAsync: listResale, isPending: isResalePending } =
    useListResale();
  const { isLoading, user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
    }
  }, [currentUser, isLoading, router]);

  console.log(userTickets);

  // Group tickets by event ID
  const groupedTickets = userTickets?.reduce(
    (acc, ticket) => {
      const eventId = ticket.eventId;
      if (!acc[eventId]) {
        acc[eventId] = {
          event: ticket.event,
          tickets: [],
          ticketCount: 0,
          statusSummary: { active: 0, listed: 0, used: 0 },
        };
      }
      acc[eventId].tickets.push(ticket);
      acc[eventId].ticketCount += 1;
      if (ticket.isUsed) acc[eventId].statusSummary.used += 1;
      else if (ticket.isListed) acc[eventId].statusSummary.listed += 1;
      else acc[eventId].statusSummary.active += 1;
      return acc;
    },
    {} as Record<
      string,
      {
        event: Ticket["event"];
        tickets: Ticket[];
        ticketCount: number;
        statusSummary: { active: number; listed: number; used: number };
      }
    >
  );

  const handleListForResale = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    if (ticket.resaleCount >= 1) {
      toast.error(
        "This ticket has already been resold once and cannot be listed again."
      );
      return;
    }
    setSelectedTicket(ticket);
    setIsResaleModalOpen(true);
  };

  const handleConfirmResale = async (payload: {
    resalePrice: string;
    bankCode: string;
    accountNumber: string;
  }) => {
    if (!selectedTicket) {
      toast.error("No ticket selected");
      return;
    }

    const resalePayload: ListResalePayload = {
      ticketId: selectedTicket.id,
      resalePrice: Number.parseFloat(payload.resalePrice),
      bankCode: payload.bankCode,
      accountNumber: payload.accountNumber,
    };

    try {
      await listResale(resalePayload, {
        onSuccess: () => {
          toast.success("Ticket listed for resale successfully!");
          setIsResaleModalOpen(false);
          setSelectedTicket(null);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to list ticket for resale.");
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to list ticket for resale.");
    }
  };

  const getStatusColor = (ticket: { isUsed: boolean; isListed: boolean }) => {
    if (ticket.isUsed) return "secondary";
    if (ticket.isListed) return "destructive";
    return "success";
  };

  const getStatusText = (ticket: { isUsed: boolean; isListed: boolean }) => {
    if (ticket.isUsed) return "Used";
    if (ticket.isListed) return "Listed for Resale";
    return "Active";
  };

  const toggleEventExpansion = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Authentication...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your session
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Animated BG Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-1">Manage your event tickets</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">
                {userTickets?.length || 0}
              </p>
            </div>
          </div>

          {groupedTickets && Object.keys(groupedTickets).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedTickets).map(
                (
                  [eventId, { event, tickets, ticketCount, statusSummary }],
                  index
                ) => (
                  <motion.div
                    key={eventId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/20">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <Link href={`/events/${eventId}`}>
                              <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                                {event.name}
                              </CardTitle>
                            </Link>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="line-clamp-1">
                                  {event.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="success">
                                {statusSummary.active} Active
                              </Badge>
                              {statusSummary.listed > 0 && (
                                <Badge variant="destructive">
                                  {statusSummary.listed} Listed
                                </Badge>
                              )}
                              {statusSummary.used > 0 && (
                                <Badge variant="secondary">
                                  {statusSummary.used} Used
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                            <p className="text-sm text-gray-600">Total Tickets</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {ticketCount}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <Button
                          className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={(e) => toggleEventExpansion(eventId, e)}
                        >
                          {expandedEvent === eventId ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" /> Hide
                              Tickets
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" /> View
                              Tickets ({ticketCount})
                            </>
                          )}
                        </Button>

                        {expandedEvent === eventId && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6"
                          >
                            {/* Mobile-first ticket layout */}
                            <div className="space-y-3">
                              {tickets.map((ticket, ticketIndex) => (
                                <motion.div
                                  key={ticket.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: ticketIndex * 0.05,
                                  }}
                                >
                                  <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                                    {/* Mobile-optimized layout */}
                                    <div className="flex items-start space-x-3">
                                      <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                                        <TicketIcon className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        {/* Header row */}
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0">
                                            <Link href={`/ticket/${ticket.id}`}>
                                              <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-base truncate">
                                                Ticket #{ticket.code}
                                              </h4>
                                            </Link>
                                            {ticket.ticketCategory && (
                                              <p className="text-sm text-gray-600 mt-1 truncate">
                                                {ticket.ticketCategory.name}
                                              </p>
                                            )}
                                          </div>
                                          <span className="text-base font-bold text-gray-900 flex-shrink-0">
                                            {ticket?.ticketCategory?.price == 0
                                              ? "Free"
                                              : formatPrice(
                                                  ticket?.ticketCategory?.price ?? 0
                                                )}
                                          </span>
                                        </div>

                                        {/* Status and action row */}
                                        <div className="flex items-center justify-between mt-3 gap-2">
                                          <Badge
                                            variant={getStatusColor(ticket)}
                                            className="text-xs flex-shrink-0"
                                          >
                                            {getStatusText(ticket)}
                                          </Badge>
                                          
                                          <div className="flex-shrink-0">
                                            {!ticket.isListed && !ticket.isUsed && (
                                              <Button
                                                size="sm"
                                                className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-3 py-1 text-xs h-7 shadow-lg hover:shadow-xl transition-all duration-300"
                                                onClick={(e) =>
                                                  handleListForResale(ticket, e)
                                                }
                                                disabled={ticket?.ticketCategory?.price === 0}
                                              >
                                                List for Resale
                                              </Button>
                                            )}
                                            {ticket.isListed && (
                                              <Button
                                                size="sm"
                                                className="bg-gray-400 text-white rounded-full px-3 py-1 text-xs h-7"
                                                disabled
                                              >
                                                Listed: {formatPrice(ticket.resalePrice ?? 0)}
                                              </Button>
                                            )}
                                            {ticket.isUsed && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-full px-3 py-1 text-xs h-7"
                                                disabled
                                              >
                                                Used
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tickets yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any tickets yet. Start exploring events!
              </p>
              <Button
                asChild
                className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/explore">Explore Events</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <ResaleModal
        isOpen={isResaleModalOpen}
        onClose={() => setIsResaleModalOpen(false)}
        selectedTicket={selectedTicket}
        onConfirmResale={handleConfirmResale}
        isPending={isResalePending}
      />
    </div>
  );
}