import axios from "../axios";
import {
  BuyTicketPayload,
  ListResalePayload,
  Ticket,
  TicketResponse,
  TicketResale,
  TicketCategory,
} from "@/types/tickets.type";
import { toast } from "sonner";

// BUY a new ticket (primary)
export const buyTicket = async (
  data: BuyTicketPayload
): Promise<TicketResponse> => {
  try {
    const res = await axios.post(`/tickets/buy`, data, {
      headers: { "x-client-page": window.location.href },
    });
    toast.success(res.data.message || "Ticket purchased successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to purchase ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// BUY from resale
export const buyResaleTicket = async (data: {
  ticketIds: string[];
}): Promise<TicketResponse> => {
  try {
    const res = await axios.post("/tickets/resale/buy", data);
    toast.success(res.data.message || "Resale ticket purchased successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to purchase resale ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// LIST ticket for resale
export const listTicketForResale = async (
  data: ListResalePayload
): Promise<TicketResale> => {
  try {
    const res = await axios.post("/tickets/resale/list", data);
    toast.success(res.data.message || "Ticket listed for resale successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to list ticket for resale";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
// FETCH my tickets
export const getMyTickets = async (): Promise<Ticket[]> => {
  const res = await axios.get("/tickets/my");
  return res.data;
};

// FETCH resale listings
export const getResaleListings = async (
  eventId?: string
): Promise<TicketResale[]> => {
  const res = await axios.get("/tickets/resell", {
    params: eventId ? { eventId } : undefined,
  });
  return res.data;
};

// VERIFY ticket
export const verifyTicket = async (data: {
  ticketId?: string;
  code?: string;
  eventId: string;
}): Promise<{
  status: string;
  ticketId: string;
  code: string;
  eventId: string;
  ticketCategory: TicketCategory | undefined;
  markedUsed: boolean;
  resalePrice: any;
  event: Event | undefined;
  message: string | undefined; isValid: boolean; ticket?: Ticket 
}> => {
  try {
    const res = await axios.post("/tickets/verify", data);
    toast.success(res.data.message || "Ticket verified successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to verify ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
// FETCH my resale listings
export const getMyListings = async (): Promise<TicketResale[]> => {
  const res = await axios.get("/tickets/my/resales");
  return res.data;
};

// FETCH tickets bought from resale
export const getBoughtFromResale = async (): Promise<Ticket[]> => {
  const res = await axios.get("/tickets/bought-from-resale");
  return res.data;
};

// REMOVE ticket from resale
export const removeResaleTicket = async (ticketId: string): Promise<TicketResale> => {
  try {
    const res = await axios.post("/tickets/resale/remove", { ticketId });
    toast.success(res.data.message || "Ticket removed from resale successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to remove resale ticket";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

