"use client";

import { memo } from "react";
import { Search } from "lucide-react";

interface EventsFiltersProps {
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  sortBy: string;
  sortOrder: string;
  viewMode: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  onViewModeChange: (mode: string) => void;
}

export const EventsFilters = memo(function EventsFilters({
  searchTerm,
  statusFilter,
  categoryFilter,
  sortBy,
  sortOrder,
  viewMode,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onViewModeChange,
}: EventsFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 sm:h-4 w-3 sm:w-4" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Music">Music</option>
          <option value="Art">Art</option>
          <option value="Business">Business</option>
          <option value="Sports">Sports</option>
        </select>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            onSortChange(field, order);
          }}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="ticketsSold-desc">Most Popular</option>
          <option value="revenue-desc">Highest Revenue</option>
          <option value="name-asc">Name A-Z</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange("table")}
            className={`px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
              viewMode === "table"
                ? "bg-[#1E88E5] text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
              viewMode === "grid"
                ? "bg-[#1E88E5] text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            Grid
          </button>
        </div>
      </div>
    </div>
  );
});
