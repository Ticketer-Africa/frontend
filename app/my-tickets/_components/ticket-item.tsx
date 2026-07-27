"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Ticket } from "@/types/tickets.type";
import { formatPrice } from "@/lib/helpers";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Ticket01Icon } from "@hugeicons/core-free-icons";

/**
 * Helper functions hoisted outside component
 * Performance: Prevents recreation on every render
 */
export const getStatusColor = (ticket: {
  isUsed: boolean;
  isListed: boolean;
}) => {
  if (ticket.isUsed) return "secondary";
  if (ticket.isListed) return "destructive";
  return "success";
};

export const getStatusText = (ticket: {
  isUsed: boolean;
  isListed: boolean;
}) => {
  if (ticket.isUsed) return "Used";
  if (ticket.isListed) return "Listed for Resale";
  return "Active";
};

/**
 * Memoized TicketItem - Prevents re-renders for unchanged tickets
 * Performance: Each ticket in the list can re-render independently
 */
export const TicketItem = memo(function TicketItem({
  ticket,
  onListForResale,
  onRemoveFromResale,
  isRemovePending,
}: {
  ticket: Ticket;
  onListForResale: (ticket: Ticket, e: React.MouseEvent) => void;
  onRemoveFromResale: (ticketId: string) => void;
  isRemovePending: boolean;
}) {
  return (
    <div
      className={`ticket-item-animate bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-4 transition-[background-color,color,border-color,opacity,transform] duration-200`}
    >
      {/* Mobile-optimized layout */}
      <div className="flex items-start space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
          <HugeiconsIcon icon={Ticket01Icon} className="h-5 w-5 text-[#1E88E5]" />
        </div>
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link href={`/ticket/${ticket.id}`}>
                <h4 className="font-semibold text-gray-900 hover:text-[#1E88E5] transition-colors text-base truncate">
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
                : formatPrice(ticket?.ticketCategory?.price ?? 0)}
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
                  className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-3 py-1 text-xs h-7 shadow-lg transition-[background-color,color,border-color,opacity,transform] duration-150"
                  onClick={(e) => onListForResale(ticket, e)}
                  disabled={ticket?.ticketCategory?.price === 0}
                >
                  List for Resale
                </Button>
              )}
              {ticket.isListed && (
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="bg-gray-400 text-white rounded-full px-2 text-xs h-6"
                    disabled
                  >
                    {formatPrice(ticket.resalePrice ?? 0)}
                  </Button>

                  <Button
                    onClick={() => onRemoveFromResale(ticket.id)}
                    disabled={isRemovePending}
                    className="p-0 rounded-full bg-transparent hover:bg-transparent"
                    title="Remove from resale"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 text-red-600 hover:text-red-700 transition-colors" />
                  </Button>
                </div>
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
  );
});
