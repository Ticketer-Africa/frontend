import { useState } from "react";
import { TicketCategoryV2 } from "@/types/events-v2.type";
import { toast } from "sonner";
import { MAX_TICKETS_PER_ORDER } from "@/lib/ticket-limits";

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
    const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (total > MAX_TICKETS_PER_ORDER) return null;
    return { selected, quantities };
  } catch {
    return null;
  }
}

export function useTicketSelection(ticketCategories: TicketCategoryV2[], eventId?: string) {
  const restored = restoreFromCheckoutData(eventId);
  const [selected, setSelected] = useState<Set<string>>(restored?.selected ?? new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>(restored?.quantities ?? {});

  // Deselected categories keep their quantity for re-selection, so only
  // selected ones count toward the cap.
  const selectedTotal = (q: Record<string, number>, excludeId?: string) =>
    Array.from(selected)
      .filter((id) => id !== excludeId)
      .reduce((sum, id) => sum + (q[id] ?? 1), 0);

  const showLimitToast = () =>
    toast.error("Ticket limit reached", {
      description: `You can select up to ${MAX_TICKETS_PER_ORDER} tickets per purchase.`,
    });

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

    const remaining = MAX_TICKETS_PER_ORDER - selectedTotal(quantities);
    if (remaining <= 0) {
      showLimitToast();
      return;
    }
    setSelected((prev) => new Set(prev).add(id));
    setQuantities((q) => ({ ...q, [id]: Math.min(q[id] || 1, remaining) }));
  };

  const updateQuantity = (
    id: string,
    value: number | ((prev: number) => number),
  ) => {
    const category = ticketCategories.find((c) => c.id === id);
    if (!category) return;

    const max = Math.min(category.maxTickets - (category.minted ?? 0), MAX_TICKETS_PER_ORDER);
    setQuantities((prev) => {
      const current = prev[id] ?? 1;
      const next = typeof value === "function" ? value(current) : value;

      if (selectedTotal(prev, id) + next > MAX_TICKETS_PER_ORDER) {
        showLimitToast();
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
