export interface ResaleTicket {
  id: string;
  code: string;
  userId: string;
  eventId: string;
  isUsed: boolean;
  isListed: boolean;
  resalePrice: number;
  listedAt: string;
  soldTo: string | null;
  resaleCount: number;
  resaleCommission: number | null;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  maxTickets: number;
  minted: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  date: Date;
  category: string;
  bannerUrl: string;
  isActive: boolean;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  maxTickets: number;
  minted: number;
  organizerd: string;
  tickets: ResaleTicket[]; 
  ticketCategories? :  TicketCategory[]
}

export interface CreateEventDTO {
  name: string;
  description: string;
  price: number;
  location: string;
  date: string;
  file?: File;
  maxTickets: number;
}

export interface UpdateEventDTO {
  name?: string;
  description?: string;
  price?: number;
  location?: string;
  date?:string
  category?:string
}

export interface EventFilterDTO {
  title?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface deleteEventDTO{
  id: string
}