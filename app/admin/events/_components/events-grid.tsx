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
} from "lucide-react";
import type { AdminEvent } from "./types";

interface EventsGridProps {
  events: AdminEvent[];
}

export const EventsGrid = memo(function EventsGrid({
  events,
}: EventsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {events.map((event) => (
        <EventGridCard key={event.id} event={event} />
      ))}
    </div>
  );
});

const EventGridCard = memo(function EventGridCard({
  event,
}: {
  event: AdminEvent;
}) {
  const percentage =
    event.totalTickets > 0 ? (event.ticketsSold / event.totalTickets) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
      <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black/20" />
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
        <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
          {event.description}
        </p>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-600">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-600">
              {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 sm:h-4 w-3 sm:w-4 text-slate-400" />
            <span className="text-xs sm:text-sm text-slate-600">
              by {event.organizer}
            </span>
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
            />
          </div>
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            <p className="text-sm sm:text-lg font-bold text-slate-900">
              ₦{event.revenue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-2 text-slate-600 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors">
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
});
