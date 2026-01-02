"use client";

import { useState, useCallback } from "react";
import { ResaleModal } from "@/components/resale-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useMyTickets,
  useListResale,
  useRemoveResaleTicket,
} from "@/services/tickets/tickets.queries";
import { Ticket, ListResalePayload } from "@/types/tickets.type";
import { toast } from "sonner";

import {
  MyTicketsLoading,
  EmptyTicketsState,
  MyTicketsHeader,
  BackgroundCircles,
} from "./_components/status-screens";
import { EventCard } from "./_components/event-card";

export default function MyTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isResaleModalOpen, setIsResaleModalOpen] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const { data: userTickets, isLoading } = useMyTickets();
  const { mutateAsync: listResale, isPending: isResalePending } =
    useListResale();
  const removeMutation = useRemoveResaleTicket();
  const [ticketToRemove, setTicketToRemove] = useState<string | null>(null);

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

  /**
   * Performance: useCallback prevents function recreation on each render
   */
  const handleListForResale = useCallback(
    (ticket: Ticket, e: React.MouseEvent) => {
      e.stopPropagation();
      if (ticket.resaleCount >= 1) {
        toast.error(
          "This ticket has already been resold once and cannot be listed again."
        );
        return;
      }
      setSelectedTicket(ticket);
      setIsResaleModalOpen(true);
    },
    []
  );

  const handleConfirmResale = useCallback(
    async (payload: {
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
            setIsResaleModalOpen(false);
            setSelectedTicket(null);
          },
          onError: () => {},
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to list ticket for resale.");
      }
    },
    [selectedTicket, listResale]
  );

  const toggleEventExpansion = useCallback(
    (eventId: string, e: React.MouseEvent) => {
      e.preventDefault();
      setExpandedEvent((prev) => (prev === eventId ? null : eventId));
    },
    []
  );

  const handleRemoveFromResale = useCallback((ticketId: string) => {
    setTicketToRemove(ticketId);
  }, []);

  if (isLoading) {
    return <MyTicketsLoading />;
  }

  const hasTickets = groupedTickets && Object.keys(groupedTickets).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <BackgroundCircles />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="section-animate">
          <MyTicketsHeader totalTickets={userTickets?.length || 0} />

          {hasTickets ? (
            <div className="space-y-6">
              {Object.entries(groupedTickets).map(
                (
                  [eventId, { event, tickets, ticketCount, statusSummary }],
                  index
                ) => (
                  <EventCard
                    key={eventId}
                    eventId={eventId}
                    event={event}
                    tickets={tickets}
                    ticketCount={ticketCount}
                    statusSummary={statusSummary}
                    isExpanded={expandedEvent === eventId}
                    onToggleExpand={toggleEventExpansion}
                    onListForResale={handleListForResale}
                    onRemoveFromResale={handleRemoveFromResale}
                    isRemovePending={removeMutation.isPending}
                    animationIndex={index}
                  />
                )
              )}
            </div>
          ) : (
            <EmptyTicketsState />
          )}
        </div>
      </div>

      {/* Remove from Resale Dialog */}
      <AlertDialog
        open={!!ticketToRemove}
        onOpenChange={(open) => !open && setTicketToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove ticket from resale?</AlertDialogTitle>
            <AlertDialogDescription>
              This ticket will no longer be available for others to purchase.
              You can list it again later if you change your mind (as long as it
              hasn't been resold before).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (ticketToRemove) {
                  removeMutation.mutate(ticketToRemove, {
                    onSuccess: () => {
                      toast.success("Ticket removed from resale");
                      setTicketToRemove(null);
                    },
                    onError: (error: any) => {
                      toast.error(
                        error.message || "Failed to remove ticket from resale"
                      );
                    },
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removing..." : "Remove from Resale"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resale Modal */}
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
