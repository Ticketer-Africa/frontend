"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Ticket } from "@/types/tickets.type";
import { formatDate } from "@/lib/helpers";
import { TicketItem } from "./ticket-item";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowUp01Icon, Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";

interface EventCardProps {
  eventId: string;
  event: Ticket["event"];
  tickets: Ticket[];
  ticketCount: number;
  statusSummary: { active: number; listed: number; used: number };
  isExpanded: boolean;
  onToggleExpand: (eventId: string, e: React.MouseEvent) => void;
  onListForResale: (ticket: Ticket, e: React.MouseEvent) => void;
  onRemoveFromResale: (ticketId: string) => void;
  isRemovePending: boolean;
  animationIndex: number;
}

/**
 * Event card with expandable ticket list
 */
export function EventCard({
  eventId,
  event,
  tickets,
  ticketCount,
  statusSummary,
  isExpanded,
  onToggleExpand,
  onListForResale,
  onRemoveFromResale,
  isRemovePending,
  animationIndex,
}: EventCardProps) {
  return (
    <div
      className={`ticket-card-animate ticket-card-delay-${Math.min(
        animationIndex,
        9
      )}`}
    >
      <Card className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-100/20">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <Link href={`/events/${eventId}`}>
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 hover:text-[#1E88E5] transition-colors">
                  {event.name}
                </CardTitle>
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 text-gray-500" />
                  <span className="line-clamp-1">{event.venueName}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="success">{statusSummary.active} Active</Badge>
                {statusSummary.listed > 0 && (
                  <Badge variant="destructive">
                    {statusSummary.listed} Listed
                  </Badge>
                )}
                {statusSummary.used > 0 && (
                  <Badge variant="secondary">{statusSummary.used} Used</Badge>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{ticketCount}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Button
            className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
            onClick={(e) => onToggleExpand(eventId, e)}
          >
            {isExpanded ? (
              <>
                <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4 mr-2" /> Hide Tickets
              </>
            ) : (
              <>
                <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 mr-2" /> View Tickets (
                {ticketCount})
              </>
            )}
          </Button>

          {/* CSS grid-rows animation for expand/collapse */}
          <div
            className="ticket-list-expandable mt-6"
            data-state={isExpanded ? "open" : "closed"}
          >
            <div>
              {/* Mobile-first ticket layout */}
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onListForResale={onListForResale}
                    onRemoveFromResale={onRemoveFromResale}
                    isRemovePending={isRemovePending}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
