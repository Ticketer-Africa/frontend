/**
 * Discount React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as discountsAPI from "@/services/discounts/discounts";
import {
  ApplyDiscountRequest,
  DiscountDetailsResponse,
  Discount,
  CreateDiscountPayload,
} from "@/services/discounts/discounts";

/**
 * Apply discount code hook
 */
export const useApplyDiscountCode = () => {
  return useMutation<DiscountDetailsResponse, Error, ApplyDiscountRequest>({
    mutationFn: (request) => discountsAPI.applyDiscountCode(request),
  });
};

export const useListDiscounts = (eventId: string) => {
  return useQuery<Discount[], Error>({
    queryKey: ["discounts", eventId],
    queryFn: () => discountsAPI.listDiscounts(eventId),
    enabled: !!eventId,
  });
};

export const useCreateDiscount = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Discount, Error, CreateDiscountPayload>({
    mutationFn: (payload) => discountsAPI.createDiscount(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts", eventId] });
    },
  });
};
