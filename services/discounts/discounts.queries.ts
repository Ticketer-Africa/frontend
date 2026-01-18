/**
 * Discount React Query Hooks
 */

import { useMutation } from "@tanstack/react-query";
import * as discountsAPI from "@/services/discounts/discounts";
import {
  ApplyDiscountRequest,
  DiscountDetailsResponse,
} from "@/services/discounts/discounts";

/**
 * Apply discount code hook
 */
export const useApplyDiscountCode = () => {
  return useMutation<DiscountDetailsResponse, Error, ApplyDiscountRequest>({
    mutationFn: (request) => discountsAPI.applyDiscountCode(request),
  });
};
