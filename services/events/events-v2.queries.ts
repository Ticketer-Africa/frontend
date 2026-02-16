/**
 * V2 Events React Query Hooks
 */

import { useQuery } from "@tanstack/react-query";
import * as eventsV2API from "@/services/events/events-v2";
import { EventV2 } from "@/types/events-v2.type";

/**
 * Fetch event by slug from V2 API
 * Optimized caching for detailed event pages
 */
export const useEventBySlugV2 = (slug: string) => {
  return useQuery<EventV2, Error>({
    queryKey: ["eventV2", slug],
    queryFn: () => eventsV2API.getEventBySlugV2(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
