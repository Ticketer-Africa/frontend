import { useQuery } from "@tanstack/react-query";
import * as attendeesAPI from "@/services/attendees/attendees";

export const useListAttendees = (
  eventId: string,
  params: { type?: "ALL" | "INVITE" | "TICKET"; q?: string } = {},
) => {
  return useQuery<attendeesAPI.AttendeesResponse, Error>({
    queryKey: ["attendees", eventId, params],
    queryFn: () => attendeesAPI.listAttendees(eventId, params),
    enabled: !!eventId,
  });
};
