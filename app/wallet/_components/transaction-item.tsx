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
  index: number;
  onClick: () => void;
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  index,
  onClick,
}: TransactionItemProps) {
  return (
    <div
      className="transaction-item-animate flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {getTransactionIcon(transaction.type)}
        <div>
          <p className="font-medium text-gray-900 capitalize">
            {transaction.type.toLowerCase()}
          </p>
          <p className="text-sm text-gray-600">
            {transaction.event?.name || "Payout Request"}
          </p>
          {transaction.buyer && (
            <p className="text-sm text-gray-500">
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
          className={`font-semibold ${
            transaction.type === "RESALE" ? "text-green-600" : "text-black"
          }`}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(transaction.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
});
