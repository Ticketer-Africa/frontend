import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventLayoutViewModel } from "@/types/event-layout.type";
import { TicketCategoryV2 } from "@/types/events-v2.type";

interface SelectionState {
  selected: Set<string>;
  quantities: Record<string, number>;
  totalTickets: number;
  totalAmount: number;
  hasSelection: boolean;
}

export function useEventCheckout(
  event: EventLayoutViewModel,
  mode: "live" | "preview",
  selection: SelectionState,
  ticketCategories: TicketCategoryV2[],
  selectedOccurrenceId?: string | null,
) {
  const router = useRouter();

  const handleCheckout = () => {
    if (mode === "preview") {
      toast.error("Preview mode", {
        description: "Publish your event to sell tickets.",
      });
      return;
    }

    if (selection.selected.size === 0) {
      toast.error("No tickets selected", {
        description: "Please select at least one ticket type to continue.",
      });
      return;
    }

    const checkoutItems = Array.from(selection.selected).map((id) => {
      const cat = ticketCategories.find((c) => c.id === id)!;
      return {
        ticketCategoryId: id,
        quantity: selection.quantities[id] ?? 1,
        ticketCategoryName: cat.name,
        price: cat.price,
      };
    });

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        eventId: event.id,
        eventName: event.name,
        tickets: checkoutItems,
        occurrenceId: selectedOccurrenceId ?? undefined,
      }),
    );

    router.push("/checkout");
  };

  return { handleCheckout };
}
