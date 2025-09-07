"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  Download,
  Eye,
  MoreVertical,
  MapPin,
  Users,
  Ticket,
  Plus,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { useAdminEvents } from "@/services/admin/admin.queries";

export default function AdminEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: events, isLoading: loadingEvents, error } = useAdminEvents();

  // Transform API response → UI format
  const allEvents = useMemo(() => {
    if (!events) return [];
    return events.map((ev: any) => {
      const totalTickets = ev.ticketCategories?.reduce(
        (sum: number, cat: any) => sum + (cat.maxTickets || 0),
        0
      ) || 0;

      const ticketsSold = ev.ticketCategories?.reduce(
        (sum: number, cat: any) => sum + (cat.minted || 0),
        0
      ) || 0;

      const revenue =
        ev.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + (cat.price * cat.minted),
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
      .filter((event: any) => {
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
      .sort((a: any, b: any) => {
        let aValue, bValue;

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

  // Stats
  const totalEvents = allEvents.length;
  const activeEvents = allEvents.filter((event: any) => event.status === "Active").length;
  const completedEvents = allEvents.filter((event: any) => event.status === "Completed").length;
  const totalRevenue = allEvents.reduce((sum: any, event: any) => sum + event.revenue, 0);
  const totalTicketsSold = allEvents.reduce((sum: any, event: any) => sum + event.ticketsSold, 0);

  // Toggle row expansion for mobile
  const toggleRow = (eventId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedRows(newExpanded);
  };

  // Loading / error handling
  if (loadingEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600 text-sm sm:text-base">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-sm sm:text-base">Failed to load events</p>
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
                <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                All Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage and monitor all platform events</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="h-3 sm:h-4 w-3 sm:w-4" />
                Refresh
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
                New Event
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Download className="h-3 sm:h-4 w-3 sm:w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Events"
            value={totalEvents}
            icon={<Calendar className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="blue"
          />
          <StatCard
            title="Active Events"
            value={activeEvents}
            icon={<CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="green"
          />
          <StatCard
            title="Completed"
            value={completedEvents}
            icon={<XCircle className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="gray"
          />
          <StatCard
            title="Tickets Sold"
            value={totalTicketsSold.toLocaleString()}
            icon={<Ticket className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`₦${totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />}
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-3 sm:h-4 w-3 sm:w-4" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
                setSortBy(field);
                setSortOrder(order);
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
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Events Display */}
        {viewMode === "table" ? (
          <EventsTable events={filteredEvents} toggleRow={toggleRow} expandedRows={expandedRows} />
        ) : (
          <EventsGrid events={filteredEvents} />
        )}

        {filteredEvents.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Calendar className="h-10 sm:h-12 w-10 sm:w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-sm sm:text-base">No events found</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}

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

function EventsTable({ events, toggleRow, expandedRows }: { events: any[]; toggleRow: (id: string) => void; expandedRows: Set<string> }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full hidden sm:table">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">Event</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">Organizer</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">Date & Location</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden md:table-cell">Tickets</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">Revenue</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">Status</th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {events.map((event) => {
              const percentage = (event.ticketsSold / event.totalTickets) * 100;
              return (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 sm:w-16 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">{event.name}</p>
                        <p className="text-xs sm:text-sm text-slate-600">{event.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <p className="font-medium text-slate-900 text-xs sm:text-sm">{event.organizer}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                      <span className="text-xs sm:text-sm font-medium text-slate-900">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                      <span className="text-xs sm:text-sm text-slate-600">{event.location}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-slate-600">
                          {event.ticketsSold} / {event.totalTickets}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage > 80
                              ? "bg-green-500"
                              : percentage > 50
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">₦{event.revenue.toLocaleString()}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                        event.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : event.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status === "Active" && <CheckCircle className="h-3 w-3" />}
                      {event.status === "Completed" && <Clock className="h-3 w-3" />}
                      {event.status === "Cancelled" && <XCircle className="h-3 w-3" />}
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile Card Layout */}
        <div className="sm:hidden divide-y divide-slate-200">
          {events.map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{event.name}</p>
                    <p className="text-xs text-slate-600">{event.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleRow(event.id)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              {expandedRows.has(event.id) && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">{event.organizer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-600">{event.location}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Tickets: {event.ticketsSold} / {event.totalTickets}</span>
                      <span className="font-semibold text-slate-900">
                        {((event.ticketsSold / event.totalTickets) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          (event.ticketsSold / event.totalTickets) * 100 > 80
                            ? "bg-green-500"
                            : (event.ticketsSold / event.totalTickets) * 100 > 50
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                        }`}
                        style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Revenue:</span>
                    <span className="font-bold text-slate-900">₦{event.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        event.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : event.status === "Completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status === "Active" && <CheckCircle className="h-3 w-3" />}
                      {event.status === "Completed" && <Clock className="h-3 w-3" />}
                      {event.status === "Cancelled" && <XCircle className="h-3 w-3" />}
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-3 w-3" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventsGrid({ events }: { events: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {events.map((event) => {
        const percentage = (event.ticketsSold / event.totalTickets) * 100;
        return (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    event.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : event.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {event.status}
                </span>
              </div>
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white">
                <p className="text-sm sm:text-lg font-bold">{event.name}</p>
                <p className="text-xs sm:text-sm opacity-90">{event.category}</p>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-600">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-600">{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-600">by {event.organizer}</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
                  <span className="text-slate-600">Tickets Sold</span>
                  <span className="font-semibold text-slate-900">
                    {event.ticketsSold} / {event.totalTickets}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percentage > 80
                        ? "bg-green-500"
                        : percentage > 50
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 sm:mt-4">
                  <p className="text-sm sm:text-lg font-bold text-slate-900">
                    ₦{event.revenue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-3 sm:h-4 w-3 sm:w-4" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="h-3 sm:h-4 w-3 sm:w-4" />
                    </button>
                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: any = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    gray: "from-gray-500 to-gray-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}