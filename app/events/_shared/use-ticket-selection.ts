import { useState } from "react";
import { TicketCategoryV2 } from "@/types/events-v2.type";
import { toast } from "sonner";

function restoreFromCheckoutData(eventId?: string) {
  if (!eventId || typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("checkoutData");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.eventId !== eventId || !Array.isArray(data.tickets)) return null;
    const selected = new Set<string>(data.tickets.map((t: { ticketCategoryId: string }) => t.ticketCategoryId));
    const quantities: Record<string, number> = {};
    data.tickets.forEach((t: { ticketCategoryId: string; quantity: number }) => {
      quantities[t.ticketCategoryId] = t.quantity;
    });
    return { selected, quantities };
  } catch {
    return null;
  }
}

export function useTicketSelection(ticketCategories: TicketCategoryV2[], eventId?: string) {
  const restored = restoreFromCheckoutData(eventId);
  const [selected, setSelected] = useState<Set<string>>(restored?.selected ?? new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>(restored?.quantities ?? {});

  const toggleCategory = (category: TicketCategoryV2) => {
    const id = category.id;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!quantities[id]) {
          setQuantities((q) => ({ ...q, [id]: 1 }));
        }
      }
      return next;
    });
  };

  const updateQuantity = (
    id: string,
    value: number | ((prev: number) => number),
  ) => {
    const category = ticketCategories.find((c) => c.id === id);
    if (!category) return;

    const max = Math.min(category.maxTickets - (category.minted ?? 0), 10);
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = typeof value === "function" ? value(current) : value;

      const otherTotal = Object.entries(prev)
        .filter(([key]) => key !== id)
        .reduce((sum, [, qty]) => sum + qty, 0);

      if (otherTotal + next > 10) {
        toast.error("Ticket limit reached", {
          description: "You can select up to 10 tickets per purchase.",
        });
        return prev;
      }

      return {
        ...prev,
        [id]: Math.max(1, Math.min(max, next)),
      };
    });
  };

  const totalTickets = Array.from(selected).reduce(
    (sum, id) => sum + (quantities[id] ?? 1),
    0,
  );
  const totalAmount = Array.from(selected).reduce((sum, id) => {
    const cat = ticketCategories.find((c) => c.id === id)!;
    return sum + cat.displayPrice * (quantities[id] ?? 1);
  }, 0);

  return {
    selected,
    quantities,
    toggleCategory,
    updateQuantity,
    totalTickets,
    totalAmount,
    hasSelection: totalTickets > 0,
  };
}
