"use client";

import { memo, useMemo } from "react";
import { formatPrice } from "@/lib/helpers";
import type { Transaction } from "./types";

interface QuickStatsProps {
  transactions: Transaction[];
}

export const QuickStats = memo(function QuickStats({
  transactions,
}: QuickStatsProps) {
  const stats = useMemo(() => {
    const totalEarned = transactions
      .filter((t) => t.type === "RESALE" && t.status === "SUCCESS")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawn = transactions
      .filter((t) => t.type === "WITHDRAW" && t.status === "SUCCESS")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalEarned,
      totalWithdrawn,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return (
    <div className="wallet-card-animate wallet-card-delay-1 lg:col-span-2">
      <div
        className="rounded-xl shadow-lg border grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-6"
        style={{
          backgroundColor: "var(--home-card)",
          borderColor: "var(--home-border)",
        }}
      >
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "var(--home-muted)" }}>Total Earned From Resale</p>
          <p className="text-2xl font-bold" style={{ color: "var(--home-success-text)" }}>
            {formatPrice(stats.totalEarned)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "var(--home-muted)" }}>Total Withdrawn</p>
          <p className="text-2xl font-bold" style={{ color: "var(--home-text-highlight)" }}>
            {formatPrice(stats.totalWithdrawn)}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "var(--home-muted)" }}>Transactions</p>
          <p className="text-2xl font-bold" style={{ color: "var(--home-text-highlight)" }}>
            {stats.transactionCount || "0"}
          </p>
        </div>
      </div>
    </div>
  );
});
