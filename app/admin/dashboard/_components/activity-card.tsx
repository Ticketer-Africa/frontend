"use client";

import { memo, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  RecentTransaction,
  RecentEvent,
  RecentUser,
} from "@/types/admin.type";

interface ActivityCardProps {
  title: string;
  items: any[];
  type: "transaction" | "event" | "user";
  icon: ReactNode;
}

export const ActivityCard = memo(function ActivityCard({
  title,
  items,
  type,
  icon,
}: ActivityCardProps) {
  const router = useRouter();

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
            className="text-sm text-[#1E88E5] hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
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
              return <TransactionItem key={item.id} item={item} />;
            }
            if (type === "event") {
              return <EventItem key={item.id} item={item} />;
            }
            if (type === "user") {
              return <UserItem key={item.id} item={item} />;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
});

const TransactionItem = memo(function TransactionItem({
  item,
}: {
  item: RecentTransaction;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
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
          item.status === "SUCCESS"
            ? "bg-green-100 text-green-800"
            : item.status === "PENDING"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {item.status}
      </span>
    </div>
  );
});

const EventItem = memo(function EventItem({ item }: { item: RecentEvent }) {
  const percentage =
    item.totalTickets > 0 ? (item.ticketsSold / item.totalTickets) * 100 : 0;

  return (
    <div className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
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
          />
        </div>
      </div>
    </div>
  );
});

const UserItem = memo(function UserItem({ item }: { item: RecentUser }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-xs font-bold text-white">{item.avatar}</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
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
          <span className="text-xs text-slate-500">{item.joinedDate}</span>
        </div>
      </div>
    </div>
  );
});
