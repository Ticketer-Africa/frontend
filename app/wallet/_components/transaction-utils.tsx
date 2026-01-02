import { TrendingUp, TrendingDown, Download, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/helpers";

export const formatAmount = (amount: number, type: string) => {
  const formattedAmount = formatPrice(Math.abs(amount));
  return `+${formattedAmount}`;
};

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case "PURCHASE":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case "RESALE":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "WITHDRAW":
      return <Download className="h-4 w-4 text-blue-500" />;
    default:
      return <Wallet className="h-4 w-4 text-gray-500" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
      return "destructive";
    default:
      return "default";
  }
};
