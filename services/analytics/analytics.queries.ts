import { useQuery } from "@tanstack/react-query";
import * as analyticsAPI from "@/services/analytics/analytics";
import type { EventAnalytics } from "@/services/analytics/analytics";

export const useEventAnalytics = (eventId: string) => {
  return useQuery<EventAnalytics, Error>({
    queryKey: ["analytics", eventId],
    queryFn: () => analyticsAPI.getEventAnalytics(eventId),
    enabled: !!eventId,
  });
};
