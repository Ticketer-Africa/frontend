"use client";

import { memo } from "react";
import { Bell } from "lucide-react";

export const DashboardHeader = memo(function DashboardHeader() {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back! Here's what's happening on your platform today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Loading Dashboard...</p>
    </div>
  );
}
