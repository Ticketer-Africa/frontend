import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface SendMessagePayload {
  subject: string;
  body: string;
  scheduledFor?: string;
}

export const sendMessage = async (
  eventId: string,
  payload: SendMessagePayload,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/messages`);
  await axios.post(endpoint, payload);
};
