/**
 * V2 Ticket Category Card Component
 * Displays individual ticket categories with pricing and admission info
 */

"use client";

import { TicketCategoryV2 } from "@/types/events-v2.type";
import { Button } from "@/components/ui/button";
import { Users, Ticket } from "lucide-react";

interface TicketCategoryCardV2Props {
  category: TicketCategoryV2;
  onSelectCategory: (category: TicketCategoryV2) => void;
  isSelected: boolean;
  feeMode: "ORGANIZER" | "ATTENDEE";
  primaryFeeBps: number;
}

export function TicketCategoryCardV2({
  category,
  onSelectCategory,
  isSelected,
  feeMode,
  primaryFeeBps,
}: TicketCategoryCardV2Props) {
  // Calculate fee if ATTENDEE pays
  const fee =
    feeMode === "ATTENDEE"
      ? Math.floor((category.displayPrice * primaryFeeBps) / 10000)
      : 0;

  const ticketsAvailable = category.maxTickets - category.minted;
  const isOutOfStock = ticketsAvailable <= 0;

  return (
    <div
      className={`border rounded-lg p-6 transition-all ${
        isSelected
          ? "border-[#1E88E5] bg-blue-50 ring-2 ring-[#1E88E5]/20"
          : "border-border hover:border-[#1E88E5] bg-background"
      } ${isOutOfStock ? "opacity-60" : ""}`}
    >
      {/* Category Name and Price */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {ticketsAvailable} of {category.maxTickets} available
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">
            ₦{category.displayPrice.toLocaleString()}
          </p>
          {fee > 0 && feeMode === "ATTENDEE" && (
            <p className="text-xs text-muted-foreground mt-1">
              Includes ₦{fee.toLocaleString()} fee
            </p>
          )}
        </div>
      </div>

      {/* Admission Info */}
      {category.maxAdmissions > 1 && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Admits {category.maxAdmissions} people</span>
        </div>
      )}

      {/* Select Button */}
      <Button
        onClick={() => onSelectCategory(category)}
        disabled={isOutOfStock}
        variant={isSelected ? "default" : "outline"}
        className="w-full"
      >
        {isSelected ? "Selected" : "Select"}
      </Button>

      {isOutOfStock && (
        <p className="text-center text-sm text-destructive mt-2">
          Out of Stock
        </p>
      )}
    </div>
  );
}
