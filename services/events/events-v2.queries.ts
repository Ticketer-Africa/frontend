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
