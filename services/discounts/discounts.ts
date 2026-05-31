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

export interface Discount {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  usageLimit: number | null;
  usedCount: number;
}

export interface CreateDiscountPayload {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  usageLimit?: number;
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

export const listDiscounts = async (eventId: string): Promise<Discount[]> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/discounts`);
  const response = await axios.get<Discount[]>(endpoint);
  return response.data;
};

export const createDiscount = async (
  eventId: string,
  payload: CreateDiscountPayload,
): Promise<Discount> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/discounts`);
  const response = await axios.post<Discount>(endpoint, payload);
  return response.data;
};
