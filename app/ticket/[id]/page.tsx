"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Calendar, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useMyTickets,
  useListResale,
} from "@/services/tickets/tickets.queries";
import { ResaleModal } from "@/components/resale-modal";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/helpers";
import { toast } from "sonner";
import { Ticket, ListResalePayload } from "@/types/tickets.type";

export default function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: userTickets, isLoading, isError } = useMyTickets();
  const { user } = useAuth();
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { mutateAsync: listResale, isPending: isResalePending } =
    useListResale();

  const ticket = userTickets?.find((t) => t.id === params.id);
  const event = ticket?.event;

  const getStatusColor = (ticket: Ticket) => {
    if (ticket.isUsed) return "secondary";
    if (ticket.isListed) return "destructive";
    return "default";
  };

  const getStatusText = (ticket: Ticket) => {
    if (ticket.isUsed) return "Used";
    if (ticket.isListed) return "Listed for Resale";
    return "Active";
  };

  const handleListForResale = () => {
    if (!ticket) return;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 animate-pulse">
            Loading ticket...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !ticket || !event || !ticket.ticketCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The ticket you're looking for doesn't exist or is missing required
            information.
          </p>
          <Button
            asChild
            className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/my-tickets">Back to My Tickets</Link>
          </Button>
        </div>
      </div>
    );
  }

  const originalPrice = ticket.ticketCategory.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            asChild
            className="text-gray-700 hover:text-[#1E88E5]"
          >
            <Link href="/my-tickets">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Tickets
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white rounded-xl shadow-lg border border-gray-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {event.name}
                    </CardTitle>
                    <Badge variant={getStatusColor(ticket)}>
                      {getStatusText(ticket)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Event Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Event Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <p className="text-gray-900">{event.location}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <p className="text-gray-900">
                            Doors open 30 minutes before event
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Ticket Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ticket Code:</span>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900">
                            {ticket.code}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-semibold text-gray-900">
                            {ticket.ticketCategory.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="font-semibold text-gray-900">
                            {originalPrice > 0
                              ? `${formatPrice(originalPrice)}`
                              : "Free"}
                          </span>
                        </div>
                        {ticket.isListed && ticket.resalePrice && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Listed for:</span>
                            <span className="font-semibold text-orange-600">
                              {formatPrice(ticket.resalePrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Important Notes
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Present this QR code at the event entrance</li>
                        <li>• Arrive 15-30 minutes before the event starts</li>
                        <li>
                          • This ticket is non-transferable unless resold
                          through our platform
                        </li>
                        <li>• Screenshots of QR codes are accepted</li>
                      </ul>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-4">
                        Entry QR Code
                      </h3>
                      <div className="flex justify-center">
                        <QRCodeDisplay
                          ticket={ticket}
                          userId={user?.id || ""}
                          showControls={true}
                        />
                      </div>
                    </div>

                    {!ticket.isUsed && (
                      <div className="space-y-3">
                        <Button
                          className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={handleListForResale}
                          disabled={
                            ticket.isListed ||
                            isResalePending ||
                            ticket.resaleCount >= 1
                          }
                        >
                          {ticket.isListed
                            ? `Listed for ${formatPrice(
                                ticket.resalePrice || 0
                              )}`
                            : ticket.resaleCount >= 1
                            ? "Cannot Resell Again"
                            : "List for Resale"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent border-gray-300 hover:bg-gray-100 text-gray-900"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
