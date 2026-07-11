"use client";

import { useEffect, useMemo } from "react";
import {
  Users,
  Ticket,
  Calendar,
  CreditCard,
  DollarSign,
} from "lucide-react";
import {
  useAdminStats,
  useAdminTransactions,
  useAdminEvents,
  useAdminUsers,
  useEventCategories,
  useAdminDailyRevenue,
} from "@/services/admin/admin.queries";
import {
  EventCategory,
  EventCategoryChartData,
  RecentEvent,
  RecentTransaction,
  RecentUser,
  User,
  Transaction,
} from "@/types/admin.type";
import { useRouter } from "next/navigation";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import {
  MetricCard,
  ActivityCard,
  RevenueChart,
  EventCategoriesChart,
  TicketsSoldChart,
  DashboardHeader,
  DashboardLoading,
} from "./_components";

const CHART_COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B"];

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: transactions, isLoading: loadingTransaction } = useAdminTransactions();
  const { data: events } = useAdminEvents();
  const { data: users } = useAdminUsers();
  const { data: dailyRevenue } = useAdminDailyRevenue();
  const { data: eventCategories } = useEventCategories();
  const { user: currentUser } = useUser();
  const { isLoading: authLoading } = useAuthStatus();
  const router = useRouter();

  useEffect(() => {
    if (currentUser && !["ADMIN", "SUPERADMIN"].includes(currentUser.role)) {
      router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  // Transform transactions
  const recentTransactions: RecentTransaction[] = useMemo(() => {
    return (transactions ?? []).map((txn: Transaction) => {
      const type = txn.event ? "Event" : txn.type ?? "Other";
      const displayName = txn.event?.name ?? txn.type ?? "Transaction";

      return {
        id: txn.id,
        name: txn.user?.name ?? "Unknown User",
        event: displayName,
        amount: txn.amount,
        date: txn.createdAt,
        ticketCount: txn.tickets?.length ?? 0,
        status: txn.status,
        type,
      };
    });
  }, [transactions]);

  // Transform events
  const recentEvents: RecentEvent[] = useMemo(() => {
    return (events ?? []).map((event: any) => {
      const ticketsSold =
        event.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + (cat.minted ?? 0),
          0
        ) ?? 0;

      const totalTickets =
        event.ticketCategories?.reduce(
          (sum: number, cat: any) => sum + (cat.maxTickets ?? 0),
          0
        ) ?? 0;

      return {
        id: event.id,
        name: event.name,
        ticketsSold,
        totalTickets,
        status: event.isActive ? "Active" : "Closed",
      };
    });
  }, [events]);

  // Transform users
  const recentUsers: RecentUser[] = useMemo(() => {
    return (users ?? []).map((user: User) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      joinedDate: new Date(user.createdAt).toLocaleDateString(),
      avatar: user.name ? user.name.charAt(0).toUpperCase() : "U",
    }));
  }, [users]);

  // Chart data
  const chartData = useMemo(() => {
    return (dailyRevenue ?? []).map((item: any) => ({
      date: new Date(item.date).toLocaleDateString(),
      totalRevenue: item.totalRevenue,
      platformRevenue: item.platformRevenue,
      ticketsSold: item.ticketsSold,
    }));
  }, [dailyRevenue]);

  const latestRevenue = chartData.length > 0 ? chartData[chartData.length - 1].totalRevenue : 0;
  const latestTickets = chartData.length > 0 ? chartData[chartData.length - 1].ticketsSold : 0;

  // Event categories chart data
  const eventTypeData: EventCategoryChartData[] = useMemo(() => {
    return (eventCategories ?? []).map(
      (item: EventCategory, index: number) => ({
        name: item.name,
        value: parseFloat(item.value),
        count: item.count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })
    );
  }, [eventCategories]);

  const isLoading = loadingTransaction || loadingStats;

  if (isLoading) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardHeader />

      <div className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={stats?.users ?? 0}
            change="+12.5%"
            isPositive={true}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Active Events"
            value={stats?.events ?? 0}
            change="+8.2%"
            isPositive={true}
            icon={<Calendar className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Tickets Sold"
            value={stats?.tickets ?? 0}
            change="+15.7%"
            isPositive={true}
            icon={<Ticket className="h-6 w-6" />}
            color="purple"
          />
          <MetricCard
            title="Total Platform Revenue (5%)"
            value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`}
            change="+23.1%"
            isPositive={true}
            icon={<DollarSign className="h-6 w-6" />}
            color="orange"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RevenueChart data={chartData} latestRevenue={latestRevenue} />
          <EventCategoriesChart data={eventTypeData} />
        </div>

        {/* Tickets Performance Chart */}
        <TicketsSoldChart data={chartData} latestTickets={latestTickets} />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityCard
            title="Recent Transactions"
            items={recentTransactions}
            type="transaction"
            icon={<CreditCard className="h-5 w-5 text-[#1E88E5]" />}
          />
          <ActivityCard
            title="Recent Events"
            items={recentEvents}
            type="event"
            icon={<Calendar className="h-5 w-5 text-purple-600" />}
          />
          <ActivityCard
            title="New Users"
            items={recentUsers}
            type="user"
            icon={<Users className="h-5 w-5 text-green-600" />}
          />
        </div>
      </div>
    </div>
  );
}
