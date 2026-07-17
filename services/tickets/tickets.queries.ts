import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buyTicket,
  buyResaleTicket,
  getMyTickets,
  getResaleListings,
  listTicketForResale,
  verifyTicket,
  getMyListings,
  getBoughtFromResale,
  getGuestResaleStatus,
  removeResaleTicket,
  resolvePayoutAccount,
} from "./tickets";
import {
  BuyTicketPayload,
  BuyResalePayload,
  GuestResaleStatus,
  GuestResaleStatusParams,
  ListResalePayload,
  RemoveResalePayload,
  ResolveAccountPayload,
  Ticket,
  TicketResale,
} from "@/types/tickets.type";

// Fetch all tickets I own
export const useMyTickets = () =>
  useQuery<Ticket[]>({
    queryKey: ["myTickets"],
    queryFn: getMyTickets,
  });

// Fetch all resale listings
export const useResaleListings = (eventId?: string) =>
  useQuery<TicketResale[]>({
    queryKey: ["resaleListings", eventId],
    queryFn: () => getResaleListings(eventId),
    refetchOnWindowFocus: true,
  });

// Fetch my resale listings
export const useMyListings = () =>
  useQuery<TicketResale[]>({
    queryKey: ["myResaleListings"],
    queryFn: getMyListings,
  });

// Fetch tickets bought from resale
export const useBoughtFromResale = () =>
  useQuery<Ticket[]>({
    queryKey: ["boughtFromResale"],
    queryFn: getBoughtFromResale,
  });

// Buy new ticket
export const useBuyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuyTicketPayload) => buyTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
    },
  });
};

// Buy resale ticket
export const useBuyResaleTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BuyResalePayload) => buyResaleTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
    },
  });
};

// List ticket for resale
export const useListResale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ListResalePayload) => listTicketForResale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["myResaleListings"] });
    },
  });
};

// Verify ticket
export const useVerifyTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      ticketId?: string;
      code?: string;
      eventId: string;
    }) => verifyTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
    },
  });
};

export const useResolvePayoutAccount = () =>
  useMutation({
    mutationFn: (payload: ResolveAccountPayload) => resolvePayoutAccount(payload),
  });

export const useGuestResaleStatus = (
  params: GuestResaleStatusParams,
  enabled: boolean
) =>
  useQuery<GuestResaleStatus>({
    queryKey: ["guestResaleStatus", params.ticketCode, params.email],
    queryFn: () => getGuestResaleStatus(params),
    enabled,
    retry: false,
  });

// Remove resale ticket
export const useRemoveResaleTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoveResalePayload) => removeResaleTicket(payload),
    onSuccess: () => {
      // Invalidate relevant caches so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myResaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
      queryClient.invalidateQueries({ queryKey: ["guestResaleStatus"] });
    },
  });
};
