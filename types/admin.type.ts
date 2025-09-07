import { StringDecoder } from "string_decoder";

export interface Transaction {
  id: string;
  reference?: string;
  user: { name?: string; email?: string } | null;
  event: { name?: string } | null; // keep event object for Prisma consistency
  type?: "DEPOSIT" | "WITHDRAWAL" | "PURCHASE" | "RESALE" | "FUND" | "WITHDRAW";
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  paymentMethod: string;
  createdAt: string | number | Date;
  tickets?: {
    ticket: {
      id: string;
      code: string;
    } | null;
  }[];
  ticketCount?: number; 
  name: string; 
  email?: string; 
  date: string | number | Date; 

  // 👇 new derived field for convenience
  eventName: string;
}
export default interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;            // ISO date string from backend
  category: string;
  isActive: boolean;       // straight from backend
  organizer: string;       // organizer name (fallback "Unknown")
  ticketsSold: number;     // computed from ticketCategories
  totalTickets: number;    // computed from ticketCategories
  revenue: number;         // computed from ticketCategories
  status: "Active" | "Completed"; // derived for filtering
}



// Define the shape your ActivityCard expects
export interface RecentTransaction {
  id: string;
  name: string;
  event: string;
  amount: number;
  date: string;
  ticketCount: number;
  status: string;
}

export interface RecentEvent {
  id: string;
  name: string;
  ticketsSold: number;
  totalTickets: number;
  status: string; // "Active" | "Closed"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;

  // New fields from backend
  eventsCount: number;
  totalSpent: number;
}

export interface RecentUser {
  id: string;
  name: string;
  role: string;
  joinedDate: string;
  avatar: string; // maybe initials
}

export interface EventCategory {
  name: string;
  value: string; // backend sends "75.00" as string
  count: number;
}

export interface EventCategoryChartData {
  name: string;
  value: number; // converted to number
  count: number;
  color: string;
}
