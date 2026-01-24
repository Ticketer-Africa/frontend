/**
 * V2 Ticket Types - Backend Integration
 * For /v2/tickets/buy endpoint
 */

export interface RecipientV2 {
  recipientName: string;
  recipientEmail: string;
}

export interface TicketPurchaseItemV2 {
  ticketCategoryId: string;
  quantity: number;
  recipients?: RecipientV2[];
}

export interface BuyTicketsV2Payload {
  eventId: string;
  ticketCategories: TicketPurchaseItemV2[];
  discountCode?: string;
}

export interface BuyTicketsV2Response {
  success: boolean;
  message: string;
  transactionId?: string;
  checkoutUrl?: string;
}
