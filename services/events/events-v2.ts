/**
 * Events API Service
 * v2 endpoints for events
 */

import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { EventV2 } from "@/types/events-v2.type";

const API_VERSION = "v2";

/**
 * Fetch event by slug
 */
export const getEventBySlugV2 = async (slug: string): Promise<EventV2> => {
  const endpoint = buildEndpoint(API_VERSION, `events/slug/${slug}`);
  const res = await axios.get(endpoint);
  return res.data;
};
