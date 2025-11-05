import { Ticket as TicketIcon } from "lucide-react";
import { Event } from "./events.type";
import { User } from "./user.type";

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  minted: number;
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

export interface ListResalePayload {
  ticketId: string;
  resalePrice: number;
  bankCode: string;
  accountNumber: string;
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
