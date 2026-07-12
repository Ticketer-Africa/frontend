"use client";

import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Minus, Info } from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@/lib/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TicketCategory } from "@/app/events/[id]/_components/ticket-cards";
import { TicketResale } from "@/types/tickets.type";
import { Event } from "./types";

interface QuantityStepProps {
  event: Event;
  ticketCategories?: TicketCategory[];
  resaleTicket?: TicketResale | null;
  quantities: { [key: string]: number };
  baseAmount: number;
  platformFee: number;
  gatewayFee: number;
  totalAmount: number;
  onQuantityChange: (categoryId: string, delta: number) => void;
  onContinue: () => void;
}

const CategoryQuantityRow = memo(function CategoryQuantityRow({
  category,
  quantity,
  onQuantityChange,
}: {
  category: TicketCategory;
  quantity: number;
  onQuantityChange: (categoryId: string, delta: number) => void;
}) {
  const handleDecrement = useCallback(
    () => onQuantityChange(category.id, -1),
    [onQuantityChange, category.id],
  );
  const handleIncrement = useCallback(
    () => onQuantityChange(category.id, 1),
    [onQuantityChange, category.id],
  );

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-3 block">
        {category.name} ({formatPrice(category.price)})
      </Label>
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={quantity <= 0}
          className="w-10 h-10 rounded-full border-gray-200 bg-transparent"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="text-2xl font-bold text-gray-900 w-12 text-center">
          {quantity}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={
            quantity >= 10 ||
            category.maxTickets - (category.minted ?? 0) <= quantity
          }
          className="w-10 h-10 rounded-full border-gray-200 bg-transparent"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        {category.maxTickets - (category.minted ?? 0)} tickets available
      </p>
    </div>
  );
});

export function QuantityStep({
  event,
  ticketCategories,
  resaleTicket,
  quantities,
  baseAmount,
  platformFee,
  gatewayFee,
  totalAmount,
  onQuantityChange,
  onContinue,
}: QuantityStepProps) {
  return (
    <div className="space-y-6 quantity-step-animate">
      {/* Event Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{event.name}</h3>
        <p className="text-sm text-gray-600">
          {formatDate(event.date)} • {formatTime(event.date)} • {event.location}
        </p>
      </div>

      {/* Quantity Selector */}
      {resaleTicket ? (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Number of Resale Tickets
          </Label>
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(resaleTicket.id, -1)}
              disabled={(quantities[resaleTicket.id] || 1) <= 1}
              className="w-10 h-10 rounded-full border-gray-200 bg-transparent"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <div className="text-2xl font-bold text-gray-900 w-12 text-center">
              {quantities[resaleTicket.id] || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuantityChange(resaleTicket.id, 1)}
              disabled={(quantities[resaleTicket.id] || 1) >= 10}
              className="w-10 h-10 rounded-full border-gray-200 bg-transparent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        ticketCategories?.map((category) => (
          <CategoryQuantityRow
            key={category.id}
            category={category}
            quantity={quantities[category.id] || 0}
            onQuantityChange={onQuantityChange}
          />
        ))
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>Note:</strong> Maximum of 10 tickets per purchase. Tickets are
          non-refundable once purchased. Please verify your selection before
          proceeding.
        </p>
      </div>

      {/* Price Breakdown */}
      {baseAmount > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal (Tickets)</span>
            <span>{formatPrice(baseAmount)}</span>
          </div>

          {platformFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                Service Fee
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Platform service fee</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span>{formatPrice(platformFee)}</span>
            </div>
          )}

          {gatewayFee > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee</span>
              <span>{formatPrice(gatewayFee)}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatPrice(totalAmount)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={onContinue}
        disabled={baseAmount <= 0}
        className="w-full h-12 bg-[#1E88E5] hover:bg-blue-500 text-white font-semibold rounded-xl"
      >
        Continue to Checkout
      </Button>
    </div>
  );
}
