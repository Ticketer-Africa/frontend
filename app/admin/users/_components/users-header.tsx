"use client";

import { memo } from "react";
import { Users, Download, RefreshCw } from "lucide-react";

interface UsersHeaderProps {
  onRefresh: () => void;
}

export const UsersHeader = memo(function UsersHeader({
  onRefresh,
}: UsersHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
              <Users className="h-5 sm:h-6 w-5 sm:w-6 text-[#1E88E5]" />
              All Users
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={onRefresh}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#1E88E5] text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export function UsersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Loading users...</p>
    </div>
  );
}

export function UsersError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Failed to load users</p>
    </div>
  );
}

export function UsersEmpty() {
  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <p className="text-slate-600 font-medium text-sm sm:text-base">
        No users found
      </p>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Try adjusting your filters or search terms
      </p>
    </div>
  );
}
