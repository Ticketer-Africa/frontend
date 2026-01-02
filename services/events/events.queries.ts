import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as eventsAPI from "@/services/events/events";
import {
  CreateEventDTO,
  EventFilterDTO,
  UpdateEventDTO,
  PriceRange,
} from "@/types/events.type";

/**
 * Price range hook with aggressive caching
 * This data rarely changes, so we cache it for 30 minutes
 */
export const usePriceRange = () => {
  return useQuery<PriceRange, Error>({
    queryKey: ["events", "price-range"],
    queryFn: eventsAPI.getPriceRange,
    staleTime: 30 * 60 * 1000, // Data is fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    refetchOnMount: false, // Don't refetch when component mounts if data exists
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    retry: 2, // Retry failed requests
  });
};

/**
 * All events hook with optimized caching
 *
 * Performance optimizations:
 * - staleTime: 5 minutes - prevents refetch if data is fresh
 * - gcTime: 30 minutes - keeps data in cache longer
 * - refetchOnMount: false - uses cached data on remount
 * - refetchOnWindowFocus: false - no unnecessary refetches
 * - placeholderData: keepPreviousData - shows previous data while fetching new
 */
export const useAllEvents = (
  page?: number,
  name?: string,
  minPrice?: number,
  maxPrice?: number
) => {
  return useQuery({
    queryKey: ["events", page, name, minPrice, maxPrice],
    queryFn: () => eventsAPI.getAllEvents(page, name, minPrice, maxPrice),
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false, // Use cached data on remount
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    placeholderData: (previousData) => previousData, // Show previous data while fetching
  });
};

/**
 * Filtered events hook with caching
 */
export const useFilteredEvents = (filters: EventFilterDTO) => {
  return useQuery({
    queryKey: ["events", "filtered", filters],
    queryFn: () => eventsAPI.getFilteredEvents(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Single event by ID with caching
 */
export const useEventById = (eventId: string) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventsAPI.getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Single event by slug with caching
 */
export const useEventBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => eventsAPI.getEventBySlug(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => eventsAPI.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventsAPI.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      data,
    }: {
      eventId: string;
      data: FormData; // Only accept FormData, matching useCreateEvent
    }) => eventsAPI.updateEvent(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // Invalidate specific event
    },
  });
};
export const useToggleEventStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => eventsAPI.toggleEventStatus(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useUserEvents = () => {
  return useQuery({
    queryKey: ["events", "user"],
    queryFn: eventsAPI.getUserEvents,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useOrganizerEvents = () => {
  return useQuery({
    queryKey: ["events", "organizer"],
    queryFn: eventsAPI.getOrganizerEvents,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpcomingEvents = () => {
  return useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: eventsAPI.getUpcomingEvents,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
