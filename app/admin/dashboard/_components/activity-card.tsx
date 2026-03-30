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
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          </div>
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm font-medium text-[#1E88E5] transition-colors hover:text-[#1976D2]"
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
    <div className="activity-row justify-between">
      <div className="flex-1">
        <p className="font-semibold text-foreground">
          ₦{item.amount.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.name} • {item.event}
        </p>
      </div>
      <span
        className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize ${
          item.status === "SUCCESS"
            ? "bg-[#10B981]/10 text-[#10B981]"
            : item.status === "PENDING"
            ? "bg-[#F59E0B]/10 text-[#F59E0B]"
            : "bg-[#EC4899]/10 text-[#EC4899]"
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
    <div className="activity-row block">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">{item.name}</p>
        <span
          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
            item.status === "Active"
              ? "bg-[#10B981]/10 text-[#10B981]"
              : "bg-[#F3F4F6] text-[#666666]"
          }`}
        >
          {item.status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {item.ticketsSold} / {item.totalTickets} tickets sold
          </span>
          <span className="font-semibold text-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#F3F4F6]">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage > 80
                ? "bg-[#10B981]"
                : percentage > 50
                ? "bg-[#1E88E5]"
                : "bg-[#F59E0B]"
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
    <div className="activity-row">
      <div className="activity-row-icon bg-[#F9F9F9]">
        <span className="text-xs font-bold text-[#1E88E5]">{item.avatar}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{item.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`rounded-lg px-2 py-1 text-xs font-medium ${
              item.role === "ORGANIZER"
                ? "bg-[#6366F1]/10 text-[#6366F1]"
                : item.role === "USER"
                ? "bg-[#10B981]/10 text-[#10B981]"
                : "bg-[#1E88E5]/10 text-[#1E88E5]"
            }`}
          >
            {item.role}
          </span>
          <span className="text-xs text-muted-foreground">{item.joinedDate}</span>
        </div>
      </div>
    </div>
  );
});
