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
import { optimisticUpdate } from "@/services/query-utils";

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
  const queryKey = ["discounts", eventId];
  return useMutation({
    mutationFn: (payload: CreateDiscountPayload) =>
      discountsAPI.createDiscount(eventId, payload),
    ...optimisticUpdate<Discount[], CreateDiscountPayload>(
      queryClient,
      queryKey,
      (old = [], payload) => [
        ...old,
        {
          id: `optimistic-${Date.now()}`,
          code: payload.code,
          type: payload.type,
          value: payload.value,
          usageLimit: payload.usageLimit ?? null,
          usedCount: 0,
        },
      ],
    ),
  });
};
