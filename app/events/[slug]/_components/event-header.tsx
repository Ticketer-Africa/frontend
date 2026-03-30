import { Calendar, MapPin } from "lucide-react";
import { EventV2 } from "@/types/events-v2.type";

type Props = { event: EventV2 };

export function EventHeaderV2({ event }: Props) {
  const date = new Date(event.date);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <h1 className="line-clamp-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-4">
        {event.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Meta
          icon={<Calendar className="h-5 w-5 text-[#1E88E5]" />}
          label="Date & Time"
          value={`${dateStr} • ${timeStr}`}
        />
        <Meta
          icon={<MapPin className="h-5 w-5 text-[#1E88E5]" />}
          label="Location"
          value={event.location}
        />
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
