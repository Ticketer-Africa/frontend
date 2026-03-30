"use client";

import { memo, ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "bg-[#1E88E5]/10 text-[#1E88E5]",
  green: "bg-[#10B981]/10 text-[#10B981]",
  purple: "bg-[#6366F1]/10 text-[#6366F1]",
  orange: "bg-[#F59E0B]/10 text-[#F59E0B]",
} as const;

export const MetricCard = memo(function MetricCard({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-background">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-[42px] w-[42px] items-center justify-center rounded-lg border border-border ${colorClasses[color]}`}
            >
              {icon}
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-[#10B981]" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-[#EC4899]" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-[#10B981]" : "text-[#EC4899]"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div>
          <p className="stat-value text-4xl font-semibold text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
});
