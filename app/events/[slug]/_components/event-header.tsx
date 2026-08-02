import { EventV2 } from "@/types/events-v2.type";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Location01Icon } from "@hugeicons/core-free-icons";

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
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        backgroundColor: "var(--home-card)",
        borderColor: "var(--home-border)",
      }}
    >
      <h1
        className="line-clamp-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-4"
        style={{ color: "var(--home-text)" }}
      >
        {event.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Meta
          icon={<HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" style={{ color: "var(--home-accent)" }} />}
          label="Date & Time"
          value={`${dateStr} • ${timeStr}`}
        />
        <Meta
          icon={<HugeiconsIcon icon={Location01Icon} className="h-5 w-5" style={{ color: "var(--home-accent)" }} />}
          label="Location"
          value={event.venueName || "Venue to be announced"}
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
        <div
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--home-muted)" }}
        >
          {label}
        </div>
        <div className="mt-0.5 text-sm font-medium" style={{ color: "var(--home-text)" }}>
          {value}
        </div>
      </div>
    </div>
  );
}
