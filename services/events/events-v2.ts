import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { EventV2 } from "@/types/events-v2.type";

const API_VERSION = "v2";

export const getEventBySlugV2 = async (slug: string): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/slug/${slug}`);
  const res = await axios.get(endpoint);
  return res.data;
};

export const createEventV2 = async (formData: FormData): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, "events/create");
  const res = await axios.post<EventV2>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateEventV2 = async (
  eventId: string,
  formData: FormData,
): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/${eventId}`);
  const res = await axios.patch<EventV2>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
