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
  // The page polls every 2s; a request that hangs would block every poll
  // after it, so give up and let the next poll try again.
  const res = await axios.get<PaymentStatusResponse>(endpoint, { timeout: 10_000 });
  return res.data;
};
