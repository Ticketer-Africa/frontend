import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface ApplyDiscountRequest {
  code: string;
  eventId: string;
  amount?: number;
}

export interface DiscountDetailsResponse {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  discountAmount?: number;
  finalAmount?: number;
  usageLimit: number | null;
  usedCount: number;
  remainingUses: number | null;
  isValid: boolean;
}

/**
 * Apply and validate discount code
 * @param request - Discount validation request
 * @returns Discount details with calculated amounts
 */
export const applyDiscountCode = async (
  request: ApplyDiscountRequest,
): Promise<DiscountDetailsResponse> => {
  const endpoint = buildEndpoint("v2", "discounts/validate");
  const response = await axios.post<DiscountDetailsResponse>(endpoint, request);
  return response.data;
};
