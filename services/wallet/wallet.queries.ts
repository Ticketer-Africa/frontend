import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkWalletBalance,
  withdrawFromWallet,
  getWalletTransactions,
  checkWalletPinStatus,
  setWalletPin,
} from "./wallet";
import type { SetWalletPinPayload } from "@/types/wallet.type";
import { createWalletPayout, listPayoutBanks, listPayoutDestinations, registerPayoutDestination, resolvePayoutAccount } from "./payout";


// Get wallet balance
export const useWalletBalance = () =>
  useQuery({
    queryKey: ["wallet-balance"],
    queryFn: checkWalletBalance,
    refetchOnWindowFocus: true,
  });

// Withdraw from wallet
export const useWithdrawWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { destinationId: string; amount: number; pin: string }) => createWalletPayout(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["payouts"] }),
      ]);
    },
  });
};

export const usePayoutBanks = () => useQuery({ queryKey: ["payout-banks"], queryFn: listPayoutBanks });
export const usePayoutDestinations = () => useQuery({ queryKey: ["payout-destinations"], queryFn: listPayoutDestinations });
export const useRegisterPayoutDestination = () => useMutation({ mutationFn: registerPayoutDestination });
export const useResolvePayoutAccount = () => useMutation({ mutationFn: resolvePayoutAccount });

// Get all wallet transactions
export const useWalletTransactions = () =>
  useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: getWalletTransactions,
  });

// Check if wallet PIN is set
export const useWalletPinStatus = () =>
  useQuery({
    queryKey: ["wallet-pin-status"],
    queryFn: checkWalletPinStatus,
  });

// Set or update wallet PIN
export const useSetWalletPin = () =>
  useMutation({
    mutationFn: ({ newPin, oldPin }: SetWalletPinPayload) =>
      setWalletPin(newPin, oldPin),
  });
