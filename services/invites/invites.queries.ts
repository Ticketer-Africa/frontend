import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as invitesAPI from "@/services/invites/invites";
import { AddInviteePayload, Invite, ShareableLink } from "@/services/invites/invites";

export const useListInvites = (eventId: string) => {
  return useQuery<Invite[], Error>({
    queryKey: ["invites", eventId],
    queryFn: () => invitesAPI.listInvites(eventId),
    enabled: !!eventId,
  });
};

export const useShareableLink = (eventId: string) => {
  return useQuery<ShareableLink | null, Error>({
    queryKey: ["shareableLink", eventId],
    queryFn: () => invitesAPI.getShareableLink(eventId),
    enabled: !!eventId,
  });
};

export const useAddInvitee = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Invite, Error, AddInviteePayload>({
    mutationFn: (payload) => invitesAPI.addInvitee(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useResendInvite = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (inviteId) => invitesAPI.resendInvite(eventId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useRegenerateToken = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Invite, Error, string>({
    mutationFn: (inviteId) => invitesAPI.regenerateToken(eventId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useRemoveInvitee = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (inviteId) => invitesAPI.removeInvitee(eventId, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites", eventId] });
    },
  });
};

export const useGenerateShareableLink = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ShareableLink, Error, void>({
    mutationFn: () => invitesAPI.generateShareableLink(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareableLink", eventId] });
    },
  });
};

export const useRevokeShareableLink = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => invitesAPI.revokeShareableLink(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareableLink", eventId] });
    },
  });
};
