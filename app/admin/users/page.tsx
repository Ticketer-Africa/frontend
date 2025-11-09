"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Eye,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  UserPlus,
  RefreshCw,
  Edit,
} from "lucide-react";
import { useAdminUsers } from "@/services/admin/admin.queries";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { data: users, isLoading: loadingUsers, error } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("joinedDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser && !authLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    if (currentUser && !["ADMIN", "SUPERADMIN"].includes(currentUser.role)) {
      router.push("/explore");
      return;
    }
  }, [currentUser, authLoading, router]);

  // Normalize incoming users
  const allUsers = useMemo(() => {
    if (!users) return [];
    return users.map((u: any) => {
      const eventsCount =
        typeof u.eventsCount === "number"
          ? u.eventsCount
          : Array.isArray(u.tickets)
          ? new Set(u.tickets.map((t: any) => t.eventId)).size
          : 0;

      const totalSpent =
        typeof u.totalSpent === "number"
          ? u.totalSpent
          : Array.isArray(u.transactions)
          ? u.transactions
              .filter((tx: any) => !tx.status || tx.status === "SUCCESS")
              .reduce((s: number, tx: any) => s + (tx.amount ?? 0), 0)
          : 0;

      const status = u.status ?? (u.isVerified ? "ACTIVE" : "INACTIVE");
      const lastLogin = u.lastLogin ?? null;
      const phone = u.phone ?? null;
      const location = u.location ?? null;

      const initials = (() => {
        if (u.avatar) return u.avatar;
        if (!u.name) return "U";
        const parts = u.name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      })();

      const joinedDate = u.joinedDate ?? u.createdAt ?? null;

      return {
        ...u,
        eventsCount,
        totalSpent,
        status,
        lastLogin,
        phone,
        location,
        avatar: initials,
        joinedDate,
      };
    });
  }, [users]);

  // Filtering + sorting
  const filteredUsers = useMemo(() => {
    const filtered = allUsers.filter((user: any) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (user.name ?? "").toString().toLowerCase().includes(term) ||
        (user.email ?? "").toString().toLowerCase().includes(term) ||
        (user.phone ?? "").toString().toLowerCase().includes(term) ||
        (user.location ?? "").toString().toLowerCase().includes(term);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    return filtered.sort((a: any, b: any) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = (a.name ?? "").toString().toLowerCase();
          bValue = (b.name ?? "").toString().toLowerCase();
          break;
        case "totalSpent":
          aValue = a.totalSpent ?? 0;
          bValue = b.totalSpent ?? 0;
          break;
        case "eventsAttended":
          aValue = a.eventsCount ?? 0;
          bValue = b.eventsCount ?? 0;
          break;
        case "lastLogin":
          aValue = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          bValue = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        default:
          aValue = a.joinedDate ? new Date(a.joinedDate).getTime() : 0;
          bValue = b.joinedDate ? new Date(b.joinedDate).getTime() : 0;
      }

      if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });
  }, [allUsers, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  // Summary stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u: any) => u.status === "ACTIVE").length;
  const inactiveUsers = allUsers.filter(
    (u: any) => u.status === "INACTIVE"
  ).length;
  const suspendedUsers = allUsers.filter(
    (u: any) => u.status === "SUSPENDED"
  ).length;
  const organizers = allUsers.filter((u: any) => u.role === "ORGANIZER").length;
  const totalRevenue = allUsers.reduce(
    (s: number, u: any) => s + (u.totalSpent ?? 0),
    0
  );

  // Toggle row expansion for mobile
  const toggleRow = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  // Loading / error handling
  if (loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      {/* Header */}
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
                onClick={() => window.location.reload()}
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

      <div className="py-6">
        {/* Stats Cards */}
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Users</option>
              <option value="ORGANIZER">Organizers</option>
              <option value="ADMIN">Admins</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
                setSortBy(field);
                setSortOrder(order);
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

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
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
                {filteredUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
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
                        <span
                          className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "ORGANIZER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "ADMIN" && (
                            <Shield className="h-3 w-3" />
                          )}
                          {user.role ?? "USER"}
                        </span>
                        <div>
                          <span
                            className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                              user.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : user.status === "INACTIVE"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status === "ACTIVE" && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {user.status === "INACTIVE" && (
                              <Clock className="h-3 w-3" />
                            )}
                            {user.status === "SUSPENDED" && (
                              <Ban className="h-3 w-3" />
                            )}
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-slate-600">
                            Events:
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-slate-900">
                            {user.eventsCount ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-slate-600">
                            Spent:
                          </span>
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
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button className="p-2 text-slate-600 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                        </button>
                        {user.status === "ACTIVE" ? (
                          <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Ban className="h-3 sm:h-4 w-3 sm:w-4" />
                          </button>
                        ) : user.status === "SUSPENDED" ? (
                          <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle className="h-3 sm:h-4 w-3 sm:w-4" />
                          </button>
                        ) : null}
                        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card Layout */}
            <div className="sm:hidden divide-y divide-slate-200">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">
                          {user.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {user.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-slate-600">
                          {user.email ?? "-"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleRow(user.id)}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  {expandedRows.has(user.id) && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {user.location ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "ORGANIZER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role === "ADMIN" && (
                            <Shield className="h-3 w-3" />
                          )}
                          {user.role ?? "USER"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : user.status === "INACTIVE"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "ACTIVE" && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {user.status === "INACTIVE" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {user.status === "SUSPENDED" && (
                            <Ban className="h-3 w-3" />
                          )}
                          {user.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            Events:
                          </span>
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
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-600 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Edit className="h-3 w-3" />
                        </button>
                        {user.status === "ACTIVE" ? (
                          <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Ban className="h-3 w-3" />
                          </button>
                        ) : user.status === "SUSPENDED" ? (
                          <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle className="h-3 w-3" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium text-sm sm:text-base">
                No users found
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 px-4 sm:px-0">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing {filteredUsers.length} of {allUsers.length} users
          </p>
        </div>
      </div>
    </div>
  );
}

function SimpleStat({ title, value }: { title: string; value: any }) {
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
}
