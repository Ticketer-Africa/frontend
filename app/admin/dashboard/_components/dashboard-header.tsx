"use client";

import { memo } from "react";
import { Bell } from "lucide-react";

export const DashboardHeader = memo(function DashboardHeader() {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back! Here's what's happening on your platform today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-input text-muted-foreground transition-colors hover:bg-accent">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#EC4899]" />
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
