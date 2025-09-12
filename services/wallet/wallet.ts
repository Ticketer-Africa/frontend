import axiosInstance from "../axios";
import { toast } from "sonner";
import {
  WithdrawPayload,
  WalletBalanceResponse,
  Transaction,
  PinStatusResponse,
  SetWalletPinResponse,
} from "@/types/wallet.type";

// FETCH wallet balance
export const checkWalletBalance = async (): Promise<WalletBalanceResponse> => {
  const res = await axiosInstance.get("/wallet/balance");
  return res.data;
};

// WITHDRAW from wallet
export const withdrawFromWallet = async (
  data: WithdrawPayload
): Promise<any> => {
  try {
    const res = await axiosInstance.post("/wallet/withdraw", data);
    toast.success(
      res.data.message || "Withdrawal request submitted successfully"
    );
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to process withdrawal";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// FETCH wallet transactions
export const getWalletTransactions = async (): Promise<Transaction[]> => {
  const res = await axiosInstance.get("/wallet/transactions");
  return res.data;
};

// SET or UPDATE wallet PIN
export const setWalletPin = async (
  pin: string,
  oldPin?: string
): Promise<SetWalletPinResponse> => {
  try {
    const res = await axiosInstance.patch("/wallet/pin", {
      newPin: pin,
      ...(oldPin && { oldPin }),
    });



    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update wallet PIN";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// CHECK if wallet PIN is set
export const checkWalletPinStatus = async (): Promise<PinStatusResponse> => {
  try {
    const res = await axiosInstance.get("/wallet/pin-status");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to check wallet PIN status";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};