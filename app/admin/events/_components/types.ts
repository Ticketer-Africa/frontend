export interface AdminEvent {
  id: string;
  name: string;
  description: string;
  location: string;
  date: string;
  category: string;
  isActive: boolean;
  organizer: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: number;
  status: string;
}

export type SortField = "date" | "ticketsSold" | "revenue" | "name";
export type SortOrder = "asc" | "desc";
export type ViewMode = "table" | "grid";
