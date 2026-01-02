import { TicketCategory } from "@/app/events/[id]/_components/ticket-cards";
import { TicketResale } from "@/types/tickets.type";

// Constants matching Backend Logic
export const GATEWAY_FEE_BPS = 150; // 1.5%
export const DEFAULT_PLATFORM_FEE_BPS = 350; // 3.5% (Matches backend default)

export interface Event {
  id: string;
  name: string;
  price: number;
  date: Date;
  location?: string;
  primaryFee?: number;
}

export interface TicketPurchaseModalProps {
  event: Event;
  ticketCategories?: TicketCategory[];
  resaleTicket?: TicketResale | null;
  isOpen: boolean;
  onClose: () => void;
  quantities: { [key: string]: number };
  setQuantities: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
}

export type ModalStep = "quantity" | "auth" | "payment" | "success";

/**
 * Calculate ticket costs including fees
 */
export function calculateCosts(
  resaleTicket: TicketResale | null | undefined,
  ticketCategories: TicketCategory[] | undefined,
  quantities: { [key: string]: number },
  primaryFee?: number
) {
  // 1. Calculate Base Price (Tickets only)
  let baseAmount = 0;

  if (resaleTicket) {
    baseAmount =
      (resaleTicket.resalePrice || 0) * (quantities[resaleTicket.id] || 1);
  } else {
    baseAmount =
      ticketCategories?.reduce((sum, category) => {
        const quantity = quantities[category.id] || 0;
        return sum + category.price * quantity;
      }, 0) || 0;
  }

  // 2. Determine Fee Rates
  const platformBps = primaryFee ?? DEFAULT_PLATFORM_FEE_BPS;
  const totalFeeBps = platformBps + GATEWAY_FEE_BPS;

  // 3. Calculate Total Fee (Combined)
  const totalFees =
    baseAmount > 0 ? Math.floor((baseAmount * totalFeeBps) / 10000) : 0;

  // 4. Split for Display
  const gatewayFee =
    baseAmount > 0 ? Math.floor((baseAmount * GATEWAY_FEE_BPS) / 10000) : 0;

  const platformFee = totalFees - gatewayFee;

  // 5. Final Total
  const totalAmount = baseAmount + totalFees;

  return {
    baseAmount,
    platformFee,
    gatewayFee,
    totalAmount,
  };
}
