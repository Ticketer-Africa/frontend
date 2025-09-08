"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Ticket,
  Calendar,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAdminStats } from "@/services/admin/admin.queries";
import { useAdminTransactions } from "@/services/admin/admin.queries";
import { useAdminEvents } from "@/services/admin/admin.queries";
import { useAdminUsers } from "@/services/admin/admin.queries";
import { useEventCategories } from "@/services/admin/admin.queries";
import { useAdminDailyRevenue } from "@/services/admin/admin.queries";
import {
  EventCategory,
  EventCategoryChartData,
  RecentEvent,
  RecentTransaction,
  RecentUser,
  User,
} from "@/types/admin.type";
import { Transaction } from "@/types/admin.type";
import router from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboard() {
  const {
    data: stats,
    isLoading: loadingStats,
    error: statsError,
  } = useAdminStats();
  const {
    data: transactions,
    isLoading: loadingTransaction,
    error: transactionsError,
  } = useAdminTransactions();
  const {
    data: events,
    isLoading: loadingEvent,
    error: eventError,
  } = useAdminEvents();
  const {
    data: users,
    isLoading: loadingUsers,
    error: usersError,
  } = useAdminUsers();
  const {
    data: dailyRevenue,
    isLoading: loadingDailyRevenue,
    error: dailyRevenueError,
  } = useAdminDailyRevenue();
  const {
    data: eventCategories,
    isLoading: loadingEventCategories,
    error: eventCategoriesError,
  } = useEventCategories();
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

  const isLoading = loadingTransaction || loadingStats;

  // Safely map transactions only if transactions exist
  const recentTransactions: RecentTransaction[] = (transactions ?? []).map(
    (txn: Transaction) => {
      // Determine the type
      const type = txn.event ? "Event" : txn.type ?? "Other"; // txn.type could be "WITHDRAW" or "DEPOSIT"

      // Set the display name for event or transaction type
      const displayName = txn.event?.name ?? txn.type ?? "Transaction";

      return {
        id: txn.id,
        name: txn.user?.name ?? "Unknown User",
        event: displayName, // shows event name OR "WITHDRAW"/"DEPOSIT"
        amount: txn.amount,
        date: txn.createdAt,
        ticketCount: txn.tickets?.length ?? 0,
        status: txn.status,
        type, // optional: keep type to style differently if needed
      };
    }
  );

  console.log(transactions);

  const recentEvents: RecentEvent[] = (events ?? []).map((event: any) => {
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
  const recentUsers: RecentUser[] = (users ?? []).map((user: User) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    joinedDate: new Date(user.createdAt).toLocaleDateString(),
    avatar: user.name ? user.name.charAt(0).toUpperCase() : "U",
  }));
  // build chartData from backend response
  const chartData = (dailyRevenue ?? []).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString(),
    totalRevenue: item.totalRevenue,
    platformRevenue: item.platformRevenue,
    ticketsSold: item.ticketsSold,
  }));

  // get latest values for headers
  const latestRevenue =
    chartData.length > 0 ? chartData[chartData.length - 1].totalRevenue : 0;
  const latestTickets =
    chartData.length > 0 ? chartData[chartData.length - 1].ticketsSold : 0;

  const colors: string[] = ["#6366F1", "#EC4899", "#10B981", "#F59E0B"];

  const eventTypeData: EventCategoryChartData[] = (eventCategories ?? []).map(
    (item: EventCategory, index: number): EventCategoryChartData => ({
      name: item.name,
      value: parseFloat(item.value), // "75.00" -> 75
      count: item.count,
      color: colors[index % colors.length],
    })
  );

  if (isLoading) return <p>Loading Dashboard...</p>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Welcome back! Here's what's happening on your platform today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div> */}
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={stats?.users}
            change="+12.5%"
            isPositive={true}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          <MetricCard
            title="Active Events"
            value={stats?.events}
            change="+8.2%"
            isPositive={true}
            icon={<Calendar className="h-6 w-6" />}
            color="green"
          />
          <MetricCard
            title="Tickets Sold"
            value={stats?.tickets}
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
          {/* Revenue Chart */}
          {/* Daily Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Daily Revenue
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Revenue earned each day
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    ₦{latestRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    +12.5% vs last week
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow:
                        "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                    }}
                    formatter={(val) => [`₦${val.toLocaleString()}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#1E88E5"
                    strokeWidth={3}
                    dot={{ fill: "#1E88E5", strokeWidth: 2, r: 4 }}
                    activeDot={{
                      r: 6,
                      stroke: "#1E88E5",
                      strokeWidth: 2,
                      fill: "#ffffff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Categories Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Event Categories
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Distribution breakdown
              </p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Events"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-3">
                {eventTypeData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-slate-700 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Performance Chart */}
        {/* Daily Tickets Sold Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-green-600" />
                  Daily Tickets Sold
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Number of tickets sold each day
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">
                  {latestTickets}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  +15.7% growth
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow:
                      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
                  }}
                  formatter={(val) => [val, "Tickets Sold"]}
                />
                <Bar
                  dataKey="ticketsSold"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityCard
            title="Recent Transactions"
            items={recentTransactions}
            type="transaction"
            icon={<CreditCard className="h-5 w-5 text-blue-600" />}
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

function MetricCard({ title, value, change, isPositive, icon, color }: any) {
  const colorClasses: any = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
          >
            {icon}
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-semibold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </span>
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ message, severity, time, amount }: any) {
  // const severityConfig = {
  //   high: {
  //     bg: "bg-red-50",
  //     border: "border-red-200",
  //     badge: "bg-red-100 text-red-800 border-red-200",
  //     button: "bg-red-600 hover:bg-red-700"
  //   },
  //   medium: {
  //     bg: "bg-yellow-50",
  //     border: "border-yellow-200",
  //     badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
  //     button: "bg-yellow-600 hover:bg-yellow-700"
  //   },
  //   low: {
  //     bg: "bg-blue-50",
  //     border: "border-blue-200",
  //     badge: "bg-blue-100 text-blue-800 border-blue-200",
  //     button: "bg-blue-600 hover:bg-blue-700"
  //   },
  // };

  type Severity = "high" | "medium" | "low";

  const severityConfig: Record<
    Severity,
    {
      bg: string;
      border: string;
      badge: string;
      button: string;
    }
  > = {
    high: {
      bg: "bg-red-100",
      border: "border-red-500",
      badge: "text-red-700",
      button: "bg-red-600",
    },
    medium: {
      bg: "bg-yellow-100",
      border: "border-yellow-500",
      badge: "text-yellow-700",
      button: "bg-yellow-600",
    },
    low: {
      bg: "bg-green-100",
      border: "border-green-500",
      badge: "text-green-700",
      button: "bg-green-600",
    },
  };

  function getConfig(severity: Severity) {
    return severityConfig[severity];
  }

  // ✅ Example usage:
  const config = getConfig("high");
  console.log(config.bg); // "bg-red-100"

  return (
    <div
      className={`flex items-center justify-between p-4 ${config.bg} rounded-lg border ${config.border} hover:shadow-sm transition-all`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.badge}`}
        >
          {severity.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{message}</p>
          {amount && (
            <p className="text-xs text-slate-600 mt-1">Amount: {amount}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500 font-medium">{time}</span>
        <button
          className={`px-4 py-2 ${config.button} text-white text-sm rounded-lg font-medium transition-colors`}
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

function ActivityCard({ title, items, type, icon }: any) {
  const router = useRouter(); // App Router's router

  const handleViewAll = () => {
    if (type === "transaction") router.push("/admin/transactions");
    else if (type === "event") router.push("/admin/events");
    else if (type === "user") router.push("/admin/users");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.slice(0, 4).map((item: any) => {
            if (type === "transaction") {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      ₦{item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {item.name} • {item.event}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      item.status == "SUCCESS"
                        ? "bg-green-100 text-green-800"
                        : item.status == "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            }
            if (type === "event") {
              const percentage = (item.ticketsSold / item.totalTickets) * 100;
              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900 text-sm">
                      {item.name}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {item.ticketsSold} / {item.totalTickets} tickets sold
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
                </div>
              );
            }
            if (type === "user") {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-white">
                      {item.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.role === "ORGANIZER"
                            ? "bg-purple-100 text-purple-800"
                            : item.role === "USER"
                            ? "text-green-800 bg-green-100"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.role}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.joinedDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
}
