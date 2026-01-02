"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { TicketResale } from "@/types/tickets.type";
import { Event } from "./types";

interface PaymentStepProps {
  event: Event;
  resaleTicket?: TicketResale | null;
  quantities: { [key: string]: number };
  baseAmount: number;
  platformFee: number;
  gatewayFee: number;
  totalAmount: number;
  isBuying: boolean;
  onPurchase: () => void;
}

export function PaymentStep({
  event,
  resaleTicket,
  quantities,
  baseAmount,
  platformFee,
  gatewayFee,
  totalAmount,
  isBuying,
  onPurchase,
}: PaymentStepProps) {
  const ticketCount = resaleTicket
    ? quantities[resaleTicket.id] || 1
    : Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="space-y-6 payment-step-animate">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">{event.name}</span>
          <Badge variant="secondary">{ticketCount} tickets</Badge>
        </div>
        <div className="text-sm text-gray-600 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Tickets</span>
            <span>{formatPrice(baseAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fees</span>
            <span>{formatPrice(platformFee + gatewayFee)}</span>
          </div>
        </div>
        <div className="text-lg font-bold text-gray-900 border-t pt-2 flex justify-between">
          <span>Total</span>
          <span>{formatPrice(totalAmount)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      <Button
        onClick={onPurchase}
        disabled={isBuying}
        className="w-full h-12 bg-[#1E88E5] hover:bg-blue-500 text-white font-semibold rounded-xl"
      >
        {isBuying ? "Processing..." : "Complete Purchase"}
      </Button>
    </div>
  );
}
