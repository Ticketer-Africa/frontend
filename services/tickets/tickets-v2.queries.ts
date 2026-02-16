/**
 * V2 Tickets React Query Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ticketsV2API from "@/services/tickets/tickets-v2";
import {
  BuyTicketsV2Payload,
  BuyTicketsV2Response,
} from "@/types/tickets-v2.type";

/**
 * Buy tickets via V2 API
 */
export const useBuyTicketsV2 = () => {
  const queryClient = useQueryClient();

  return useMutation<BuyTicketsV2Response, Error, BuyTicketsV2Payload>({
    mutationFn: (data) => ticketsV2API.buyTicketsV2(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
    },
  });
};
