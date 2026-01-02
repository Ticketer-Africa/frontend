"use client";

import { memo } from "react";
import { TrendingUp, Ticket, Activity } from "lucide-react";
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
import type { EventCategoryChartData } from "@/types/admin.type";

interface RevenueChartProps {
  data: any[];
  latestRevenue: number;
}

export const RevenueChart = memo(function RevenueChart({
  data,
  latestRevenue,
}: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#1E88E5]" />
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
          <LineChart data={data}>
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
              formatter={(val: any) => [`₦${val.toLocaleString()}`, "Revenue"]}
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
  );
});

interface EventCategoriesChartProps {
  data: EventCategoryChartData[];
}

export const EventCategoriesChart = memo(function EventCategoriesChart({
  data,
}: EventCategoriesChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-600" />
          Event Categories
        </h3>
        <p className="text-sm text-slate-600 mt-1">Distribution breakdown</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Events"]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
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
  );
});

interface TicketsSoldChartProps {
  data: any[];
  latestTickets: number;
}

export const TicketsSoldChart = memo(function TicketsSoldChart({
  data,
  latestTickets,
}: TicketsSoldChartProps) {
  return (
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
            <p className="text-2xl font-bold text-slate-900">{latestTickets}</p>
            <p className="text-sm text-green-600 font-medium">+15.7% growth</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
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
  );
});
