import { formatPrice } from "@/lib/helpers";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartDownIcon, ChartUpIcon, Download02Icon, Wallet01Icon } from "@hugeicons/core-free-icons";

export const formatAmount = (amount: number, type: string) => {
  const formattedAmount = formatPrice(Math.abs(amount));
  return `+${formattedAmount}`;
};

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case "PURCHASE":
      return <HugeiconsIcon icon={ChartDownIcon} className="h-4 w-4 text-red-500" />;
    case "RESALE":
      return <HugeiconsIcon icon={ChartUpIcon} className="h-4 w-4" style={{ color: "var(--home-success)" }} />;
    case "WITHDRAW":
      return <HugeiconsIcon icon={Download02Icon} className="h-4 w-4" style={{ color: "var(--home-accent)" }} />;
    default:
      return <HugeiconsIcon icon={Wallet01Icon} className="h-4 w-4" style={{ color: "var(--home-muted-dim)" }} />;
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
