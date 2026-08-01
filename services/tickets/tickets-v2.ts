/**
 * Tickets API Service
 * v2 endpoints for tickets
 */

import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import {
  BuyTicketsV2Payload,
  BuyTicketsV2Response,
} from "@/types/tickets-v2.type";
import { toast } from "sonner";

const API_VERSION = "v2";

/**
 * Buy tickets via v2 API
 */
export const buyTicketsV2 = async (
  data: BuyTicketsV2Payload
): Promise<BuyTicketsV2Response> => {
  try {
    const endpoint = buildEndpoint(API_VERSION, "tickets/buy");
    const res = await axios.post(endpoint, data, {
      headers: { "x-client-page": window.location.href },
    });
    toast.success("Ticket purchased", {
      description: res.data.message || "Your ticket has been added to your account.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to purchase ticket";
    toast.error("Purchase failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};
