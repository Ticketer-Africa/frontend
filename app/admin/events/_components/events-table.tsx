"use client";

import { memo } from "react";
import {
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { AdminEvent } from "./types";

interface EventsTableProps {
  events: AdminEvent[];
  toggleRow: (id: string) => void;
  expandedRows: Set<string>;
}

export const EventsTable = memo(function EventsTable({
  events,
  toggleRow,
  expandedRows,
}: EventsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <table className="w-full hidden sm:table">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                Event
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                Organizer
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">
                Date & Location
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden md:table-cell">
                Tickets
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm hidden lg:table-cell">
                Revenue
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                Status
              </th>
              <th className="text-left px-4 sm:px-6 py-3 sm:py-4 font-semibold text-slate-900 text-xs sm:text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {events.map((event) => (
              <EventTableRow key={event.id} event={event} />
            ))}
          </tbody>
        </table>

        {/* Mobile Card Layout */}
        <div className="sm:hidden divide-y divide-slate-200">
          {events.map((event) => (
            <MobileEventCard
              key={event.id}
              event={event}
              isExpanded={expandedRows.has(event.id)}
              onToggle={() => toggleRow(event.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

const EventTableRow = memo(function EventTableRow({
  event,
}: {
  event: AdminEvent;
}) {
  const percentage =
    event.totalTickets > 0 ? (event.ticketsSold / event.totalTickets) * 100 : 0;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 sm:w-16 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm sm:text-base">
              {event.name}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              {event.category}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <p className="font-medium text-slate-900 text-xs sm:text-sm">
          {event.organizer}
        </p>
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
          <span className="text-xs sm:text-sm text-slate-600">
            {event.location}
          </span>
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
            />
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <p className="font-bold text-slate-900 text-xs sm:text-sm">
          ₦{event.revenue.toLocaleString()}
        </p>
      </td>
      <td className="px-4 sm:px-6 py-4">
        <StatusBadge status={event.status} />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <ActionButtons />
      </td>
    </tr>
  );
});

interface MobileEventCardProps {
  event: AdminEvent;
  isExpanded: boolean;
  onToggle: () => void;
}

const MobileEventCard = memo(function MobileEventCard({
  event,
  isExpanded,
  onToggle,
}: MobileEventCardProps) {
  const percentage =
    event.totalTickets > 0 ? (event.ticketsSold / event.totalTickets) * 100 : 0;

  return (
    <div className="p-4">
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
          onClick={onToggle}
          className="text-slate-600 hover:text-slate-900"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      {isExpanded && (
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
              <span className="text-slate-600">
                Tickets: {event.ticketsSold} / {event.totalTickets}
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
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Revenue:</span>
            <span className="font-bold text-slate-900">
              ₦{event.revenue.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={event.status} />
          </div>
          <ActionButtons size="small" />
        </div>
      )}
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-3 w-3" />;
      case "Completed":
        return <Clock className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
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

const ActionButtons = memo(function ActionButtons({
  size = "normal",
}: {
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
      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
        <MoreVertical className={iconSize} />
      </button>
    </div>
  );
});
