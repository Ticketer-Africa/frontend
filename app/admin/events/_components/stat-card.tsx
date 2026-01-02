"use client";

import { memo, ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "green" | "gray" | "purple" | "orange";
}

const colorClasses = {
  blue: "from-blue-500 to-[#1E88E5]",
  green: "from-green-500 to-green-600",
  gray: "from-gray-500 to-gray-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
} as const;

export const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
});
