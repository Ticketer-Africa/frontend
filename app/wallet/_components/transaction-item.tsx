"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "./types";
import {
  formatAmount,
  getTransactionIcon,
  getStatusColor,
} from "./transaction-utils";

interface TransactionItemProps {
  transaction: Transaction;
  onClick: () => void;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  onClick,
}: TransactionItemProps) {
  return (
    <div
      className="transaction-item-animate flex items-center justify-between p-4 border rounded-xl transition-colors cursor-pointer"
      style={{
        backgroundColor: "var(--home-card-elevated)",
        borderColor: "var(--home-border)",
      }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {getTransactionIcon(transaction.type)}
        <div>
          <p className="font-medium capitalize" style={{ color: "var(--home-text)" }}>
            {transaction.type.toLowerCase()}
          </p>
          <p className="text-sm" style={{ color: "var(--home-muted)" }}>
            {transaction.event?.name || "Payout Request"}
          </p>
          {transaction.buyer && (
            <p className="text-sm" style={{ color: "var(--home-muted-dim)" }}>
              Buyer: {transaction.buyer.name}
            </p>
          )}
          <div className="flex items-center space-x-2">
            <Badge
              variant={getStatusColor(transaction.status) as any}
              className="text-xs"
            >
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p
          className="font-semibold"
          style={{
            color:
              transaction.type === "RESALE"
                ? "var(--home-success-text)"
                : "var(--home-text)",
          }}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </p>
        <p className="text-sm" style={{ color: "var(--home-muted-dim)" }}>
          {new Date(transaction.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
});
