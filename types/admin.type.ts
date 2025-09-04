export interface Transaction {
  id: string;
  user: { name: string };
  event: { name: string };
  amount: number;
  createdAt: string; // or Date if your backend returns Date
  tickets: any[];    // can be more specific if you know ticket structure
  status: string;
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
