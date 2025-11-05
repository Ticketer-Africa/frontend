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
  removeResaleTicket,
} from "./tickets";
import {
  BuyTicketPayload,
  ListResalePayload,
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
    mutationFn: (payload: { ticketIds: string[] }) => buyResaleTicket(payload),
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


// Remove resale ticket
export const useRemoveResaleTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => removeResaleTicket(ticketId),
    onSuccess: () => {
      // Invalidate relevant caches so UI updates instantly
      queryClient.invalidateQueries({ queryKey: ["resaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myResaleListings"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
    },
  });
};
