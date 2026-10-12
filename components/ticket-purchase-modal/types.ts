import { TicketCategory } from "@/app/events/[id]/_components/ticket-cards";
import { TicketResale } from "@/types/tickets.type";

// Constants matching Backend Logic (backend/src/common/helpers/fee.helper.ts)
export const GATEWAY_FEE_BPS = 150; // Kora's 1.5% pay-in fee
export const GATEWAY_FEE_VAT_BPS = 750; // 7.5% VAT Kora adds to that fee
export const DEFAULT_PLATFORM_FEE_BPS = 350; // 3.5% (Matches backend default)

/**
 * Kora's pay-in fee plus VAT on a Naira amount, rounded up to the kobo the
 * same way the backend charges it (₦3,500 → ₦56.44).
 */
export function calculateGatewayFee(amount: number): number {
  const kobo = Math.round(amount * 100);
  const feeKobo = Math.ceil(
    (kobo * GATEWAY_FEE_BPS * (10000 + GATEWAY_FEE_VAT_BPS)) / 1e8
  );
  return feeKobo / 100;
}

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

  // 2. Fees, in kobo like the backend: platform fee floors, gateway fee
  // (with VAT) rounds up.
  const platformBps = primaryFee ?? DEFAULT_PLATFORM_FEE_BPS;
  const baseKobo = Math.round(baseAmount * 100);
  const platformFee = Math.floor((baseKobo * platformBps) / 10000) / 100;
  const gatewayFee = calculateGatewayFee(baseAmount);

  // 3. Final Total
  const totalAmount = (baseKobo + Math.round((platformFee + gatewayFee) * 100)) / 100;

  return {
    baseAmount,
    platformFee,
    gatewayFee,
    totalAmount,
  };
}
