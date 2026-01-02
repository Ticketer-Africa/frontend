export interface Transaction {
  id: string;
  reference: string;
  type: "PURCHASE" | "RESALE" | "WITHDRAW";
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  createdAt: string;
  buyer: { id: string; name: string; email: string } | null;
  event: { id: string; name: string } | null;
  tickets: { id: string; code: string; event: { id: string; name: string } }[];
}

export type TransactionType = "PURCHASE" | "RESALE" | "WITHDRAW";
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED";
