"use client";

import { memo } from "react";
import {
  Eye,
  Edit,
  MoreVertical,
  Mail,
  Calendar,
  MapPin,
  Shield,
  Ban,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { AdminUser } from "./types";
import { UsersEmpty } from "./users-header";

interface UsersTableProps {
  users: AdminUser[];
  expandedRows: Set<string>;
  toggleRow: (id: string) => void;
}

export const UsersTable = memo(function UsersTable({
  users,
  expandedRows,
  toggleRow,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <table className="w-full hidden sm:table">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm">
                User
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm">
                Contact
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm">
                Role & Status
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm hidden lg:table-cell">
                Stats
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm hidden lg:table-cell">
                Joined
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <UserTableRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>

        {/* Mobile Card Layout */}
        <div className="sm:hidden divide-y divide-slate-200">
          {users.map((user) => (
            <MobileUserCard
              key={user.id}
              user={user}
              isExpanded={expandedRows.has(user.id)}
              onToggle={() => toggleRow(user.id)}
            />
          ))}
        </div>
      </div>

      {users.length === 0 && <UsersEmpty />}
    </div>
  );
});

const UserTableRow = memo(function UserTableRow({ user }: { user: AdminUser }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs sm:text-sm font-bold text-white">
              {user.avatar}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              {user.name ?? "Unknown"}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">
                {user.location ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-600">
              {user.email ?? "-"}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="space-y-2">
          <RoleBadge role={user.role} />
          <div>
            <StatusBadge status={user.status} />
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-600">Events:</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900">
              {user.eventsCount ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-600">Spent:</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900">
              ₦{(user.totalSpent ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center gap-2">
          <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
          <div>
            <p className="text-xs sm:text-sm font-medium text-slate-900">
              {user.joinedDate
                ? new Date(user.joinedDate).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <UserActions status={user.status} />
      </td>
    </tr>
  );
});

interface MobileUserCardProps {
  user: AdminUser;
  isExpanded: boolean;
  onToggle: () => void;
}

const MobileUserCard = memo(function MobileUserCard({
  user,
  isExpanded,
  onToggle,
}: MobileUserCardProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-white">{user.avatar}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              {user.name ?? "Unknown"}
            </p>
            <p className="text-xs text-slate-600">{user.email ?? "-"}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-600 hover:text-slate-900"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">
              {user.location ?? "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={user.role} />
            <StatusBadge status={user.status} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Events:</span>
              <span className="text-xs font-semibold text-slate-900">
                {user.eventsCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Spent:</span>
              <span className="text-xs font-semibold text-slate-900">
                ₦{(user.totalSpent ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-900">
                {user.joinedDate
                  ? new Date(user.joinedDate).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
          <UserActions status={user.status} size="small" />
        </div>
      )}
    </div>
  );
});

const RoleBadge = memo(function RoleBadge({ role }: { role: string }) {
  const getRoleStyles = () => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ORGANIZER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getRoleStyles()}`}
    >
      {role === "ADMIN" && <Shield className="h-3 w-3" />}
      {role ?? "USER"}
    </span>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-3 w-3" />;
      case "INACTIVE":
        return <Clock className="h-3 w-3" />;
      default:
        return <Ban className="h-3 w-3" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusStyles()}`}
    >
      {getIcon()}
      {status}
    </span>
  );
});

const UserActions = memo(function UserActions({
  status,
  size = "normal",
}: {
  status: string;
  size?: "small" | "normal";
}) {
  const iconSize = size === "small" ? "h-3 w-3" : "h-3 sm:h-4 w-3 sm:w-4";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button className="p-2 text-slate-600 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors">
        <Eye className={iconSize} />
      </button>
      <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
        <Edit className={iconSize} />
      </button>
      {status === "ACTIVE" ? (
        <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Ban className={iconSize} />
        </button>
      ) : status === "SUSPENDED" ? (
        <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
          <CheckCircle className={iconSize} />
        </button>
      ) : null}
      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className={iconSize} />
      </button>
    </div>
  );
});
