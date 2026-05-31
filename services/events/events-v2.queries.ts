import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as eventsV2API from "@/services/events/events-v2";
import { EventV2 } from "@/types/events-v2.type";

export const useEventBySlugV2 = (slug: string) => {
  return useQuery<EventV2, Error>({
    queryKey: ["eventV2", slug],
    queryFn: () => eventsV2API.getEventBySlugV2(slug),
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useEventByIdV2 = (id: string) => {
  return useQuery<EventV2, Error>({
    queryKey: ["eventV2", id],
    queryFn: () => eventsV2API.getEventByIdV2(id),
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateEventV2 = () => {
  const queryClient = useQueryClient();
  return useMutation<EventV2, Error, FormData>({
    mutationFn: (formData) => eventsV2API.createEventV2(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
    },
  });
};

export const useUpdateEventV2 = () => {
  const queryClient = useQueryClient();
  return useMutation<EventV2, Error, { eventId: string; formData: FormData }>({
    mutationFn: ({ eventId, formData }) =>
      eventsV2API.updateEventV2(eventId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizerEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });
};

export const useAllEventsV2 = (
  page?: number,
  name?: string,
  minPrice?: number,
  maxPrice?: number,
) => {
  return useQuery({
    queryKey: ["eventsV2", page, name, minPrice, maxPrice],
    queryFn: () => eventsV2API.getAllEventsV2(page, name, minPrice, maxPrice),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
};

export const useOrganizerEventsV2 = () => {
  return useQuery({
    queryKey: ["eventsV2", "organizer"],
    queryFn: eventsV2API.getOrganizerEventsV2,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
