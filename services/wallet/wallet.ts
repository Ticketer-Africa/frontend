import axiosInstance from "../axios";
import { toast } from "sonner";
import {
  WithdrawPayload,
  WalletBalanceResponse,
  Transaction,
  PinStatusResponse,
  SetWalletPinResponse,
} from "@/types/wallet.type";
import { buildEndpoint } from "../api-config";

const API_VERSION = "v1";

// FETCH wallet balance
export const checkWalletBalance = async (): Promise<WalletBalanceResponse> => {
  const res = await axiosInstance.get(
    buildEndpoint(API_VERSION, "wallet/balance")
  );
  return res.data;
};

// WITHDRAW from wallet
export const withdrawFromWallet = async (
  data: WithdrawPayload
): Promise<any> => {
  try {
    const res = await axiosInstance.post(
      buildEndpoint(API_VERSION, "wallet/withdraw"),
      data
    );
    toast.success("Withdrawal requested", {
      description: res.data.message || "Your withdrawal request has been submitted.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to process withdrawal";
    toast.error("Withdrawal failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// FETCH wallet transactions
export const getWalletTransactions = async (): Promise<Transaction[]> => {
  const res = await axiosInstance.get(
    buildEndpoint(API_VERSION, "wallet/transactions")
  );
  return res.data;
};

// SET or UPDATE wallet PIN
export const setWalletPin = async (
  pin: string,
  oldPin?: string
): Promise<SetWalletPinResponse> => {
  try {
    const res = await axiosInstance.patch(
      buildEndpoint(API_VERSION, "wallet/pin"),
      {
        newPin: pin,
        ...(oldPin && { oldPin }),
      }
    );

    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update wallet PIN";
    toast.error("PIN update failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// CHECK if wallet PIN is set
export const checkWalletPinStatus = async (): Promise<PinStatusResponse> => {
  try {
    const res = await axiosInstance.get(
      buildEndpoint(API_VERSION, "wallet/pin-status")
    );
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to check wallet PIN status";
    toast.error("Couldn't check PIN status", { description: errorMessage });
    throw new Error(errorMessage);
  }
};
