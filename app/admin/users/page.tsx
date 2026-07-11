"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAdminUsers } from "@/services/admin/admin.queries";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  UsersHeader,
  UsersLoading,
  UsersError,
  UsersStatsGrid,
  UsersFilters,
  UsersTable,
  type AdminUser,
} from "./_components";

export default function AdminUsersPage() {
  const { data: users, isLoading: loadingUsers, error } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("joinedDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { user: currentUser } = useUser();
  const { isLoading: authLoading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && !["ADMIN", "SUPERADMIN"].includes(currentUser.role)) {
      router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  // Normalize incoming users
  const allUsers: AdminUser[] = useMemo(() => {
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
    const filtered = allUsers.filter((user) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (user.name ?? "").toString().toLowerCase().includes(term) ||
        (user.email ?? "").toString().toLowerCase().includes(term) ||
        (user.phone ?? "").toString().toLowerCase().includes(term) ||
        (user.location ?? "").toString().toLowerCase().includes(term);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    return filtered.sort((a, b) => {
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
  const stats = useMemo(() => ({
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u) => u.status === "ACTIVE").length,
    inactiveUsers: allUsers.filter((u) => u.status === "INACTIVE").length,
    suspendedUsers: allUsers.filter((u) => u.status === "SUSPENDED").length,
    organizers: allUsers.filter((u) => u.role === "ORGANIZER").length,
    totalRevenue: allUsers.reduce((s, u) => s + (u.totalSpent ?? 0), 0),
  }), [allUsers]);

  const toggleRow = useCallback((userId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(userId)) {
        newExpanded.delete(userId);
      } else {
        newExpanded.add(userId);
      }
      return newExpanded;
    });
  }, []);

  const handleSortChange = useCallback((field: string, order: string) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (loadingUsers) {
    return <UsersLoading />;
  }

  if (error) {
    return <UsersError />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      <UsersHeader onRefresh={handleRefresh} />

      <div className="py-6">
        <UsersStatsGrid {...stats} />

        <UsersFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearchTerm}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
          onSortChange={handleSortChange}
        />

        <UsersTable
          users={filteredUsers}
          expandedRows={expandedRows}
          toggleRow={toggleRow}
        />

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
