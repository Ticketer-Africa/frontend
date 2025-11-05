import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkWalletBalance,
  withdrawFromWallet,
  getWalletTransactions,
  checkWalletPinStatus,
  setWalletPin,
} from "./wallet";
import type {
  SetWalletPinPayload,
  WithdrawPayload,
} from "@/types/wallet.type";


// Get wallet balance
export const useWalletBalance = () =>
  useQuery({
    queryKey: ["wallet-balance"],
    queryFn: checkWalletBalance,
  });

// Withdraw from wallet
export const useWithdrawWallet = () =>
  useMutation({
    mutationFn: (data: WithdrawPayload) => withdrawFromWallet(data),
  });

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
