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
  admitsCount?: number | null;
  ticketCategoryId?: string | null;
  ticketCategoryName?: string | null;
}

export type InviteDeliveryMode = "GENERATE" | "SEND";

export interface AddInviteePayload {
  email?: string;
  phone?: string;
  name: string;
  mode?: InviteDeliveryMode;
  admitsCount?: number;
  ticketCategoryId?: string;
}

export interface UpdateInvitePayload {
  name?: string;
  email?: string;
  phone?: string;
  tableNumber?: string;
  ticketCategoryId?: string | null;
}

export interface ShareableLink {
  token: string;
}

const BASE = (eventId: string) => `events/${eventId}/invites`;

interface RawInvite {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  admitsCount?: number | null;
  ticketCategoryId?: string | null;
  ticketCategoryName?: string | null;
  inviteLink?: string;
  inviteToken?: string;
  usedAt?: string | null;
}

export const listInvites = async (eventId: string): Promise<Invite[]> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const res = await axios.get<{ invites?: RawInvite[] } | RawInvite[]>(endpoint);
  // Backend returns { eventId, total, invites: [...] }; tolerate a bare array too.
  const raw: RawInvite[] = Array.isArray(res.data)
    ? res.data
    : (res.data?.invites ?? []);
  return raw.map((inv) => ({
    id: inv.id,
    eventId,
    email: inv.email ?? null,
    phone: inv.phone ?? null,
    name: inv.name ?? "",
    status: inv.usedAt ? "ACCEPTED" : "PENDING",
    token: inv.inviteToken ?? "",
    inviteLink: inv.inviteLink,
    admitsCount: inv.admitsCount ?? null,
    ticketCategoryId: inv.ticketCategoryId ?? null,
    ticketCategoryName: inv.ticketCategoryName ?? null,
  }));
};

export interface AddInvitesResponse {
  eventId: string;
  mode?: InviteDeliveryMode;
  addedCount: number;
  skippedCount: number;
  added: Array<{
    id: string;
    email: string | null;
    phone: string | null;
    name: string | null;
    admitsCount?: number | null;
    ticketCategoryId?: string | null;
    ticketCategoryName?: string | null;
    inviteLink?: string;
    inviteToken?: string;
    createdAt?: string;
  }>;
}

export const addInvitee = async (
  eventId: string,
  payload: AddInviteePayload,
): Promise<AddInvitesResponse> => {
  const endpoint = buildEndpoint("v2", BASE(eventId));
  const { mode, ...invitee } = payload;
  const res = await axios.post<AddInvitesResponse>(endpoint, {
    invitees: [invitee],
    ...(mode ? { mode } : {}),
  });
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

export type VerifyInviteStatus =
  | "VALID"
  | "ALREADY_USED"
  | "INACTIVE"
  | "NOT_STARTED"
  | "EVENT_PASSED";

export interface VerifyInviteResponse {
  status: VerifyInviteStatus;
  message: string;
  invite: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    admitsCount?: number | null;
    ticketCategoryName?: string | null;
  };
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    location: string | null;
    bannerUrl: string | null;
    organizerId: string;
    isActive: boolean;
  };
  alreadyUsed: boolean;
  usedAt: string | null;
}

export const verifyInvite = async (
  inviteToken: string,
): Promise<VerifyInviteResponse> => {
  const endpoint = buildEndpoint("v2", "events/invite/verify");
  const res = await axios.post<VerifyInviteResponse>(endpoint, { inviteToken });
  return res.data;
};

export const updateInvite = async (
  eventId: string,
  inviteId: string,
  payload: UpdateInvitePayload,
): Promise<void> => {
  const endpoint = buildEndpoint("v2", `${BASE(eventId)}/${inviteId}`);
  await axios.patch(endpoint, payload);
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

// Returns a base64 data URL — preferred for embedding in a card the user
// downloads via html-to-image, which can't inline blob: URLs on canvas.
export const getInviteQrDataUrl = async (
  eventId: string,
  inviteId: string,
): Promise<string> => {
  const blob = await getInviteQrBlob(eventId, inviteId);
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read QR"));
    reader.readAsDataURL(blob);
  });
};
