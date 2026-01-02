"use client";

import { memo } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./stat-card";
import type { AdminEvent } from "./types";

interface StatsGridProps {
  events: AdminEvent[];
}

export const StatsGrid = memo(function StatsGrid({ events }: StatsGridProps) {
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (event) => event.status === "Active"
  ).length;
  const completedEvents = events.filter(
    (event) => event.status === "Completed"
  ).length;
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalTicketsSold = events.reduce(
    (sum, event) => sum + event.ticketsSold,
    0
  );

  return (
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
  );
});
