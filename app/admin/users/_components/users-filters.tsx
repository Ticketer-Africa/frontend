"use client";

import { memo } from "react";
import { Search } from "lucide-react";

interface UsersFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}

export const UsersFilters = memo(function UsersFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  sortBy,
  sortOrder,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onSortChange,
}: UsersFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Users</option>
          <option value="ORGANIZER">Organizers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            onSortChange(field, order);
          }}
        >
          <option value="joinedDate-desc">Newest First</option>
          <option value="joinedDate-asc">Oldest First</option>
          <option value="lastLogin-desc">Recent Activity</option>
          <option value="totalSpent-desc">Highest Spent</option>
          <option value="eventsAttended-desc">Most Active</option>
          <option value="name-asc">Name A-Z</option>
        </select>
      </div>
    </div>
  );
});
