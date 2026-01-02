"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/helpers";
import { TicketCategory } from "./ticket-cards";

interface FloatingCartProps {
  selectedCategories: TicketCategory[];
  quantities: { [key: string]: number };
  onClearCart: () => void;
  onCheckout: () => void;
}

/**
 * Floating cart for selected tickets
 */
export function FloatingCart({
  selectedCategories,
  quantities,
  onClearCart,
  onCheckout,
}: FloatingCartProps) {
  // Calculate total price
  const totalPrice = selectedCategories.reduce((total, cat) => {
    return total + cat.price * (quantities[cat.id] || 1);
  }, 0);

  if (selectedCategories.length === 0) return null;

  return (
    <div className="floating-cart-animate fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200 z-50 md:mx-auto md:max-w-3xl md:rounded-t-lg">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Selected Tickets</h3>
          <Button variant="ghost" size="sm" onClick={onClearCart}>
            <X className="h-4 w-4" />
            <span className="sr-only">Clear cart</span>
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-semibold">Total:</p>
          <p className="font-bold text-lg">
            {totalPrice > 0 ? `${formatPrice(totalPrice)}` : "Free"}
          </p>
        </div>
        <Button
          className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full"
          size="lg"
          onClick={onCheckout}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
