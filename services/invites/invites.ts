import { buildEndpoint } from "@/services/api-config";
import axios from "@/services/axios";

export interface Invite {
  id: string;
  eventId: string;
  email?: string | null;
  phone?: string | null;
  name: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  token: string;
  inviteLink?: string;
}

export type InviteDeliveryMode = "GENERATE" | "SEND";

export interface AddInviteePayload {
  email?: string;
  phone?: string;
  name: string;
  mode?: InviteDeliveryMode;
}

export interface ShareableLink {
  token: string;
}

const BASE = (eventId: string) => `events/${eventId}/invites`;

export const listInvites = async (eventId: string): Promise<Invite[]> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const res = await axios.get<Invite[]>(endpoint);
  return res.data;
};

export const addInvitee = async (
  eventId: string,
  payload: AddInviteePayload,
): Promise<Invite> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const res = await axios.post<Invite>(endpoint, payload);
  return res.data;
};

export const resendInvite = async (
  eventId: string,
  inviteId: string,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}/resend`);
  await axios.post(endpoint);
};

export const regenerateToken = async (
  eventId: string,
  inviteId: string,
): Promise<Invite> => {
  const endpoint = buildEndpoint(
    "v2",
    `${BASE(eventId)}/${inviteId}/regenerate-token`,
  );
  const res = await axios.post<Invite>(endpoint);
  return res.data;
};

export const removeInvitee = async (
  eventId: string,
  inviteId: string,
): Promise<void> => {
  // Backend uses PATCH (not DELETE) for soft-removal via the /remove sub-path
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}/remove`);
  await axios.patch(endpoint);
};

export const generateShareableLink = async (
  eventId: string,
): Promise<ShareableLink> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
  const res = await axios.post<ShareableLink>(endpoint);
  return res.data;
};

export const getShareableLink = async (
  eventId: string,
): Promise<ShareableLink | null> => {
  try {
    const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
    const res = await axios.get<ShareableLink>(endpoint);
    return res.data;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      (err as { response: { status: number } }).response?.status === 404
    ) {
      return null;
    }
    throw err;
  }
};

export const revokeShareableLink = async (eventId: string): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/shareable`);
  await axios.delete(endpoint);
};

export const getInviteQrBlob = async (
  eventId: string,
  inviteId: string,
): Promise<Blob> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}/qr`);
  const res = await axios.get(endpoint, { responseType: "blob" });
  return res.data as Blob;
};
