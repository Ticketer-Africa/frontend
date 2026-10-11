import axiosInstance from "../axios";
import { buildEndpoint } from "../api-config";

export interface PayoutBank { code: string; name: string }
export interface PayoutDestination {
  id: string; label: string; bankName: string | null; last4: string;
  resolvedAccountName: string | null; status: string; statusReason: string | null;
  isUsable: boolean; isDefault: boolean;
}

const endpoint = (path: string) => buildEndpoint("v2", `payout/${path}`);
export async function listPayoutBanks(): Promise<PayoutBank[]> {
  return (await axiosInstance.get(endpoint("banks"))).data;
}
export async function listPayoutDestinations(): Promise<PayoutDestination[]> {
  return (await axiosInstance.get(endpoint("destinations"))).data;
}
export async function resolvePayoutAccount(input: {bankCode:string; accountNumber:string}): Promise<{accountName:string; bankName?:string}> {
  return (await axiosInstance.post(endpoint("resolve-account"), input)).data;
}
export async function registerPayoutDestination(input: {label:string; bankCode:string; accountNumber:string}): Promise<PayoutDestination> {
  return (await axiosInstance.post(endpoint("destinations"), input)).data;
}
export async function createWalletPayout(input: {destinationId:string; amount:number; pin:string}) {
  return (await axiosInstance.post(endpoint("withdraw"), input)).data;
}
