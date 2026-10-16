import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import type { PaymentStatusResponse } from "@/types/payment-status.type";

export const getPaymentStatus = async (
  reference: string,
  token: string
): Promise<PaymentStatusResponse> => {
  const endpoint = buildEndpoint(
    "v1",
    `payment/status/${encodeURIComponent(reference)}/${encodeURIComponent(token)}`
  );
  const res = await axios.get<PaymentStatusResponse>(endpoint);
  return res.data;
};
