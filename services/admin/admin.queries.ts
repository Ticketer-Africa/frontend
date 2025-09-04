"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminStats, getAdminUsers, getAdminEvents, adminToggleEvent, getAdminTransactions, getAdminOrganizers, getAdminUserDetails, getAdminRevenue, getAdminDailyRevenue, getEventCategories } from "./admin";

export const useAdminStats = () => {
    return useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
};

export const useAdminUsers = () => {
    return useQuery({ queryKey: ["admin", "users"], queryFn: getAdminUsers });
};

export const useAdminEvents = () => {
    return useQuery({ queryKey: ["admin", "events"], queryFn: getAdminEvents });
};

export const useAdminToggleEvent = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (eventId: string) => adminToggleEvent(eventId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin", "events"] });
        },
    });
};

export const useAdminTransactions = () => {
    return useQuery({ queryKey: ["admin", "transactions"], queryFn: getAdminTransactions });
};

export const useAdminOrganizers = () => {
    return useQuery({ queryKey: ["admin", "organizers"], queryFn: getAdminOrganizers });
};

export const useAdminUserDetails = (userId: string) => {
    return useQuery({ queryKey: ["admin", "users", userId], queryFn: () => getAdminUserDetails(userId), enabled: !!userId });
};

export const useAdminRevenue = () => {
    return useQuery({ queryKey: ["admin", "revenue"], queryFn: getAdminRevenue });
};

export const useAdminDailyRevenue = () => {
  return useQuery({
    queryKey: ["admin", "daily-revenue"],
    queryFn: getAdminDailyRevenue,
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: ["admin", "event-categories"],
    queryFn: getEventCategories,
  });
};

