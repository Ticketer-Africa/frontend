import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface AnalyticsTrendPoint {
  day: string;
  sold: number;
  heightPct: number;
}

export interface AnalyticsTierBreakdown {
  id: string;
  name: string;
  sold: number;
  capacity: number;
  barPct: number;
}

export interface EventAnalytics {
  eventId: string;
  avgOrderValue: number;
  peakSalesDay: string | null;
  conversionRate: number;
  trend: AnalyticsTrendPoint[];
  tierBreakdown: AnalyticsTierBreakdown[];
}

export const getEventAnalytics = async (
  eventId: string,
): Promise<EventAnalytics> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/analytics`);
  const res = await axios.get<EventAnalytics>(endpoint);
  return res.data;
};
