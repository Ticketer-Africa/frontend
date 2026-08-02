import { Event } from "./events.type";
import { User } from "./user.type";

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  minted?: number;
  maxTickets: number;
}

export interface Ticket {
  id: string;
  code: string;
  eventId: string;
  userId: string;
  seatNumber?: string;
  status: "ACTIVE" | "RESOLD" | "USED";
  resale?: boolean;
  resalePrice?: number;
  createdAt: string;
  updatedAt: string;
  event: Event;
  isListed: boolean;
  isUsed: boolean;
  listedAt?: Date;
  resaleCommission: number;
  resaleCount: number;
  soldTo?: string;
  user: User;
  ticketCategory?: TicketCategory; // Added to align with backend schema
}

export interface TicketResponse {
  success: boolean;
  message: string;
  checkoutUrl: string;
}

export interface TicketCategoryItem {
  ticketCategoryId: string;
  quantity: number;
}

export interface BuyTicketPayload {
  eventId?: string;
  ticketCategories?: TicketCategoryItem[];
  resaleTicketId?: string;
}

export interface ResolveAccountPayload {
  bankCode: string;
  accountNumber: string;
}

export interface ResolvedAccount extends ResolveAccountPayload {
  accountName: string;
}

export interface LoggedInListResalePayload {
  ticketId: string;
  resalePrice: number;
  bankCode: string;
  accountNumber: string;
}

export interface GuestListResalePayload {
  ticketCode: string;
  email: string;
  resalePrice: number;
  bankCode: string;
  accountNumber: string;
}

export type ListResalePayload =
  | LoggedInListResalePayload
  | GuestListResalePayload;

export type RemoveResalePayload =
  | { ticketId: string }
  | { ticketCode: string; email: string };

export interface BuyResalePayload {
  ticketIds: string[];
  buyerEmail?: string;
  buyerName?: string;
}

export interface GuestResaleStatusParams {
  ticketCode: string;
  email: string;
}

export interface GuestResaleStatus {
  eventName?: string;
  eventDate?: string;
  ticketCategory?: string;
  isListed?: boolean;
  resalePrice?: number;
  listedAt?: string;
  isSold?: boolean;
  payoutStatus?: string;
  commissionStatus?: string;
  ticket?: Pick<
    Ticket,
    "code" | "isListed" | "resalePrice" | "listedAt" | "status" | "ticketCategory"
  >;
  event?: {
    name?: string;
    date?: string;
    venueName?: string;
  };
}

export interface TicketResale {
  id: string;
  code: string;
  eventId: string;
  userId: string;
  seatNumber?: string;
  status: "ACTIVE" | "RESOLD" | "USED";
  resale?: boolean;
  resalePrice?: number;
  createdAt: string;
  updatedAt: string;
  event: Event;
  isListed: boolean;
  isUsed: boolean;
  listedAt?: Date;
  resaleCommission: number;
  resaleCount: number;
  soldTo?: string;
  user: User;
  ticketCategory?: TicketCategory; // Added to align with backend schema
}
