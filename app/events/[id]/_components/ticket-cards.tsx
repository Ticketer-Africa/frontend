"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/helpers";
import { TicketResale } from "@/types/tickets.type";

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  minted: number;
  maxTickets: number;
}

/**
 * Memoized ResaleTicketCard - Prevents re-renders for unchanged tickets
 * Performance: Each card in a list can re-render independently
 */
export const ResaleTicketCard = memo(function ResaleTicketCard({
  ticket,
  onBuy,
}: {
  ticket: TicketResale;
  onBuy: (ticket: TicketResale) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={ticket.user.profileImage ?? undefined}
            alt={ticket.user.name}
            className="w-8 h-8 rounded-full"
          />
          <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
            {ticket.user.profileImage || ticket.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{ticket.user.name}</p>
          <p className="text-sm text-gray-600">
            Category: {ticket.ticketCategory?.name}
          </p>
          <p className="text-sm text-gray-600">
            Original:{" "}
            {ticket.ticketCategory && ticket.ticketCategory.price > 0
              ? `${formatPrice(ticket.ticketCategory.price)}`
              : "Free"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg">
          {ticket.resalePrice && `${formatPrice(ticket.resalePrice)}`}
        </p>
        <Button
          size="sm"
          className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full"
          onClick={() => onBuy(ticket)}
        >
          Buy
        </Button>
      </div>
    </div>
  );
});

/**
 * Memoized TicketCategoryCard - Prevents re-renders for unchanged categories
 */
export const TicketCategoryCard = memo(function TicketCategoryCard({
  ticketCategory,
  isSelected,
  onSelect,
  onRemove,
}: {
  ticketCategory: TicketCategory;
  isSelected: boolean;
  onSelect: (cat: TicketCategory) => void;
  onRemove: (id: string) => void;
}) {
  const ticketsAvailable = ticketCategory.maxTickets - ticketCategory.minted;

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold">{ticketCategory.name}</h3>
          <span className="text-sm text-gray-600">
            {ticketsAvailable} available
          </span>
        </div>
        <span className="text-xl font-bold">
          {ticketCategory.price > 0
            ? `${formatPrice(ticketCategory.price)}`
            : "Free"}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-gradient-to-r from-[#1E88E5] to-pink-600 h-2 rounded-full"
          style={{
            width: `${
              (ticketCategory.minted / ticketCategory.maxTickets) * 100
            }%`,
          }}
        />
      </div>
      <Button
        className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full"
        size="lg"
        disabled={ticketsAvailable === 0}
        onClick={() => {
          if (isSelected) {
            onRemove(ticketCategory.id);
          } else {
            onSelect(ticketCategory);
          }
        }}
      >
        {ticketsAvailable > 0 ? (isSelected ? "Remove" : "Select") : "Sold Out"}
      </Button>
    </div>
  );
});
