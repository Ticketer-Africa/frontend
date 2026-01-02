"use client";

import { memo } from "react";
import { Users } from "lucide-react";

interface SimpleStatProps {
  title: string;
  value: string | number;
}

export const SimpleStat = memo(function SimpleStat({
  title,
  value,
}: SimpleStatProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-[#1E88E5] text-white shadow-lg">
          <Users className="h-4 sm:h-5 w-4 sm:w-5" />
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

interface UsersStatsGridProps {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  organizers: number;
  totalRevenue: number;
}

export const UsersStatsGrid = memo(function UsersStatsGrid({
  totalUsers,
  activeUsers,
  inactiveUsers,
  suspendedUsers,
  organizers,
  totalRevenue,
}: UsersStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <SimpleStat title="Total Users" value={totalUsers} />
      <SimpleStat title="Active" value={activeUsers} />
      <SimpleStat title="Inactive" value={inactiveUsers} />
      <SimpleStat title="Suspended" value={suspendedUsers} />
      <SimpleStat title="Organizers" value={organizers} />
      <SimpleStat
        title="Total Revenue"
        value={`₦${totalRevenue.toLocaleString()}`}
      />
    </div>
  );
});
