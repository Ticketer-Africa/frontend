export interface FundWalletPayload {
  amount: number;
}

export interface CheckoutUrlResponse {
  checkoutUrl: string;
}

export interface WalletBalanceResponse {
  balance: number;
}

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";

export type TransactionType = "WITHDRAW" | "PURCHASE" | "RESALE";

export interface TicketSummary {
  id: string;
  code: string;
  eventId: string;
  userId: string;
  isUsed: boolean;
  isListed: boolean;
  resalePrice?: number;
  listedAt?: string;
  soldTo?: string;
  resaleCount: number;
  resaleCommission?: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  amount: number; // Full amount for PURCHASE/WITHDRAW, 5% platform fee for RESALE
  status: TransactionStatus;
  createdAt: string; // ISO string from DateTime
  buyer: BuyerSummary | null; // Null for WITHDRAW transactions
  event: EventSummary | null; // Null for WITHDRAW transactions
  tickets: TicketSummary[]; // Tickets associated with the transaction
}

export interface BuyerSummary {
  id: string;
  name: string;
  email: string;
}

export interface EventSummary {
  id: string;
  name: string;
}

export interface TicketSummary {
  id: string;
  code: string;
  event: EventSummary;
}

export interface PinStatusResponse {
  hasPin: boolean;
}


export interface SetWalletPinPayload {
  newPin: string;
  oldPin?: string;
}

export interface SetWalletPinResponse {
  message: string;
}