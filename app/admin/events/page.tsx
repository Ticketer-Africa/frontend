"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAdminEvents } from "@/services/admin/admin.queries";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  EventsHeader,
  EventsLoading,
  EventsError,
  EventsEmpty,
  StatsGrid,
  EventsFilters,
  EventsTable,
  EventsGrid,
  type AdminEvent,
} from "./_components";

export default function AdminEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: events, isLoading: loadingEvents, error } = useAdminEvents();
  const { isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && !["ADMIN", "SUPERADMIN"].includes(currentUser.role)) {
      router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  // Transform API response → UI format
  const allEvents: AdminEvent[] = useMemo(() => {
    if (!events) return [];
    return events.map((ev: any) => {
      const totalTickets =
        ev.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + (cat.maxTickets || 0),
          0
        ) || 0;

      const ticketsSold =
        ev.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + (cat.minted || 0),
          0
        ) || 0;

      const revenue =
        ev.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + cat.price * cat.minted,
          0
        ) || 0;

      return {
        id: ev.id,
        name: ev.name,
        description: ev.description,
        location: ev.location,
        date: ev.date,
        category: ev.category,
        isActive: ev.isActive,
        organizer: ev.organizer?.name || "Unknown",
        ticketsSold,
        totalTickets,
        revenue,
        status: ev.isActive ? "Active" : "Completed",
      };
    });
  }, [events]);

  // Filter + sort
  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((event) => {
        const matchesSearch =
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || event.status === statusFilter;

        const matchesCategory =
          categoryFilter === "ALL" || event.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case "ticketsSold":
            aValue = a.ticketsSold;
            bValue = b.ticketsSold;
            break;
          case "revenue":
            aValue = a.revenue;
            bValue = b.revenue;
            break;
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default:
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      });
  }, [allEvents, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const toggleRow = useCallback((eventId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(eventId)) {
        newExpanded.delete(eventId);
      } else {
        newExpanded.add(eventId);
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

  if (loadingEvents) {
    return <EventsLoading />;
  }

  if (error) {
    return <EventsError />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8">
      <EventsHeader onRefresh={handleRefresh} />

      <div className="py-6">
        <StatsGrid events={allEvents} />

        <EventsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          viewMode={viewMode}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onCategoryChange={setCategoryFilter}
          onSortChange={handleSortChange}
          onViewModeChange={setViewMode}
        />

        {viewMode === "table" ? (
          <EventsTable
            events={filteredEvents}
            toggleRow={toggleRow}
            expandedRows={expandedRows}
          />
        ) : (
          <EventsGrid events={filteredEvents} />
        )}

        {filteredEvents.length === 0 && <EventsEmpty />}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 px-4 sm:px-0">
          <p className="text-xs sm:text-sm text-slate-600">
            Showing {filteredEvents.length} of {allEvents.length} events
          </p>
        </div>
      </div>
    </div>
  );
}
