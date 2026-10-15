import { useState } from "react";
import { TicketCategoryV2 } from "@/types/events-v2.type";
import { MAX_TICKETS_PER_CATEGORY } from "@/lib/ticket-limits";

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
    // A selection saved before the cap was lowered would be rejected at checkout.
    if (Object.values(quantities).some((qty) => qty > MAX_TICKETS_PER_CATEGORY)) return null;
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
    if (selected.has(id)) {
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    setSelected((prev) => new Set(prev).add(id));
    setQuantities((q) => (q[id] ? q : { ...q, [id]: 1 }));
  };

  const updateQuantity = (
    id: string,
    value: number | ((prev: number) => number),
  ) => {
    const category = ticketCategories.find((c) => c.id === id);
    if (!category) return;

    const max = Math.min(category.maxTickets - (category.minted ?? 0), MAX_TICKETS_PER_CATEGORY);
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = typeof value === "function" ? value(current) : value;

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
