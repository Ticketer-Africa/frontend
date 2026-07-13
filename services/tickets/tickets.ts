import axios from "../axios";
import { buildEndpoint } from "@/services/api-config";
import {
  BuyTicketPayload,
  BuyResalePayload,
  GuestResaleStatus,
  GuestResaleStatusParams,
  ListResalePayload,
  RemoveResalePayload,
  ResolveAccountPayload,
  ResolvedAccount,
  Ticket,
  TicketResponse,
  TicketResale,
  TicketCategory,
} from "@/types/tickets.type";
import { toast } from "sonner";

const API_VERSION = "v1";
const THROTTLE_MESSAGE = "Too many attempts. Please wait a minute and try again.";
const GUEST_PROOF_MESSAGE = "Ticket not found or email does not match.";

const getApiErrorMessage = (error: any, fallback: string) => {
  if (error.response?.status === 429) return THROTTLE_MESSAGE;
  return error.response?.data?.message || fallback;
};

const getGuestProofErrorMessage = (error: any) =>
  error.response?.status === 429 ? THROTTLE_MESSAGE : GUEST_PROOF_MESSAGE;

// BUY a new ticket (primary)
export const buyTicket = async (
  data: BuyTicketPayload
): Promise<TicketResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/buy"),
      data,
      {
        headers: { "x-client-page": window.location.href },
      }
    );
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
export const buyResaleTicket = async (
  data: BuyResalePayload
): Promise<TicketResponse> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/resale/buy"),
      data
    );
    toast.success(res.data.message || "Resale ticket purchased successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage = getApiErrorMessage(
      error,
      "Failed to purchase resale ticket"
    );
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// LIST ticket for resale
export const listTicketForResale = async (
  data: ListResalePayload
): Promise<TicketResale> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/resale/list"),
      data
    );
    toast.success(res.data.message || "Ticket listed for resale successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage = "ticketCode" in data
      ? getGuestProofErrorMessage(error)
      : getApiErrorMessage(error, "Failed to list ticket for resale");
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const resolvePayoutAccount = async (
  data: ResolveAccountPayload
): Promise<ResolvedAccount> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "payment/resolve-account"),
      data
    );
    toast.success("Account verified");
    return res.data;
  } catch (error: any) {
    const errorMessage = getApiErrorMessage(error, "Failed to verify account");
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
// FETCH my tickets
export const getMyTickets = async (): Promise<Ticket[]> => {
  const res = await axios.get(buildEndpoint(API_VERSION, "tickets/my"));
  return res.data;
};

// FETCH resale listings
export const getResaleListings = async (
  eventId?: string
): Promise<TicketResale[]> => {
  const res = await axios.get(buildEndpoint(API_VERSION, "tickets/resell"), {
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
  message: string | undefined;
  isValid: boolean;
  ticket?: Ticket;
}> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/verify"),
      data
    );
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
  const res = await axios.get(buildEndpoint(API_VERSION, "tickets/my/resales"));
  return res.data;
};

// FETCH tickets bought from resale
export const getBoughtFromResale = async (): Promise<Ticket[]> => {
  const res = await axios.get(
    buildEndpoint(API_VERSION, "tickets/bought-from-resale")
  );
  return res.data;
};

// REMOVE ticket from resale
export const removeResaleTicket = async (
  data: RemoveResalePayload
): Promise<TicketResale> => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "tickets/resale/remove"),
      data
    );
    toast.success(
      res.data.message || "Ticket removed from resale successfully"
    );
    return res.data;
  } catch (error: any) {
    const errorMessage = "ticketCode" in data
      ? getGuestProofErrorMessage(error)
      : getApiErrorMessage(error, "Failed to remove resale ticket");
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getGuestResaleStatus = async (
  params: GuestResaleStatusParams
): Promise<GuestResaleStatus> => {
  try {
    const res = await axios.get(
      buildEndpoint(API_VERSION, "tickets/resale/status"),
      { params }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(getGuestProofErrorMessage(error));
  }
};
