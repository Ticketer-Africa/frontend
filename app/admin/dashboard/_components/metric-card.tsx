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
  blue: "from-blue-500 to-[#1E88E5]",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
});
