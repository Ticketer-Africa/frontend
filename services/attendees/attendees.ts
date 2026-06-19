import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export type AttendeeType = "INVITE" | "TICKET";
export type AttendeeStatus = "PENDING" | "CHECKED_IN" | "ACTIVE" | "USED";

export interface Attendee {
  id: string;
  type: AttendeeType;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: AttendeeStatus;
  inviteId: string | null;
  inviteLink: string | null;
  ticketCode: string | null;
  ticketCategoryName: string | null;
  admitsCount: number | null;
  createdAt: string;
}

export interface AttendeesResponse {
  eventId: string;
  total: number;
  counts: { invites: number; tickets: number; holders: number };
  attendees: Attendee[];
}

export const listAttendees = async (
  eventId: string,
  params: { type?: "ALL" | "INVITE" | "TICKET"; q?: string } = {},
): Promise<AttendeesResponse> => {
  const endpoint = buildEndpoint("v2", `events/${eventId}/attendees`);
  const res = await axios.get<AttendeesResponse>(endpoint, { params });
  return res.data;
};
