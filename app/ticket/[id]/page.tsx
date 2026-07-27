"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useMyTickets,
  useListResale,
} from "@/services/tickets/tickets.queries";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Calendar01Icon, Clock01Icon, Location01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import { ResaleModal } from "@/components/resale-modal";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { useUser } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/helpers";
import { toast } from "sonner";
import { Ticket, ListResalePayload } from "@/types/tickets.type";

export default function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: userTickets, isLoading, isError } = useMyTickets();
  const { user } = useUser();
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
      <div
        className="home-theme min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="text-center">
          <p className="text-lg animate-pulse" style={{ color: "var(--home-muted)" }}>
            Loading ticket...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !ticket || !event || !ticket.ticketCategory) {
    return (
      <div
        className="home-theme min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--home-bg)" }}
      >
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--home-text)" }}
          >
            Ticket Not Found
          </h1>
          <p className="mb-4" style={{ color: "var(--home-muted)" }}>
            The ticket you&apos;re looking for doesn&apos;t exist or is missing required
            information.
          </p>
          <Button
            asChild
            variant="homeAccent"
            className="px-6"
          >
            <Link href="/my-tickets">Back to My Tickets</Link>
          </Button>
        </div>
      </div>
    );
  }

  const originalPrice = ticket.ticketCategory.price;

  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="homeOutline"
            asChild
          >
            <Link href="/my-tickets">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              Back to My Tickets
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="section-animate">
            <Card
              className="rounded-xl border shadow-lg"
              style={{
                backgroundColor: "var(--home-card)",
                borderColor: "var(--home-border)",
                color: "var(--home-text)",
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle
                      className="text-2xl font-bold mb-2"
                      style={{ color: "var(--home-text)" }}
                    >
                      {event.name}
                    </CardTitle>
                    <Badge
                      variant={getStatusColor(ticket)}
                      style={{
                        backgroundColor: ticket.isUsed
                          ? "var(--home-card-highlight)"
                          : ticket.isListed
                          ? "var(--home-highlight-yellow)"
                          : "var(--home-success)",
                        borderColor: "var(--home-border-strong)",
                        color: ticket.isListed
                          ? "var(--home-bg)"
                          : "var(--home-success-fg)",
                      }}
                    >
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
                      <h3
                        className="font-semibold text-lg mb-4"
                        style={{ color: "var(--home-text)" }}
                      >
                        Event Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" style={{ color: "var(--home-text-highlight)" }} />
                          <div>
                            <p className="font-medium" style={{ color: "var(--home-text)" }}>
                              {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HugeiconsIcon icon={Location01Icon} className="h-5 w-5" style={{ color: "var(--home-text-highlight)" }} />
                          <p style={{ color: "var(--home-text)" }}>{event.location}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" style={{ color: "var(--home-text-highlight)" }} />
                          <p style={{ color: "var(--home-text)" }}>
                            Doors open 30 minutes before event
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3
                        className="font-semibold text-lg mb-4"
                        style={{ color: "var(--home-text)" }}
                      >
                        Ticket Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span style={{ color: "var(--home-muted)" }}>Ticket Code:</span>
                          <code
                            className="text-sm px-2 py-1 rounded"
                            style={{
                              backgroundColor: "var(--home-card-highlight)",
                              color: "var(--home-text)",
                            }}
                          >
                            {ticket.code}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--home-muted)" }}>Category:</span>
                          <span className="font-semibold" style={{ color: "var(--home-text)" }}>
                            {ticket.ticketCategory.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "var(--home-muted)" }}>Original Price:</span>
                          <span className="font-semibold" style={{ color: "var(--home-text)" }}>
                            {originalPrice > 0
                              ? `${formatPrice(originalPrice)}`
                              : "Free"}
                          </span>
                        </div>
                        {ticket.isListed && ticket.resalePrice && (
                          <div className="flex justify-between">
                            <span style={{ color: "var(--home-muted)" }}>Listed for:</span>
                            <span className="font-semibold" style={{ color: "var(--home-text-highlight)" }}>
                              {formatPrice(ticket.resalePrice)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: "var(--home-card-elevated)",
                        borderColor: "var(--home-border-strong)",
                      }}
                    >
                      <h4 className="font-medium mb-2" style={{ color: "var(--home-text-highlight)" }}>
                        Important Notes
                      </h4>
                      <ul className="text-sm space-y-1" style={{ color: "var(--home-muted)" }}>
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
                      <h3
                        className="font-semibold text-lg mb-4"
                        style={{ color: "var(--home-text)" }}
                      >
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
                          variant="homeAccent"
                          className="w-full px-6"
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
                          variant="homeOutline"
                          className="w-full"
                        >
                          <HugeiconsIcon icon={Share08Icon} className="h-4 w-4 mr-2" />
                          Share Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
