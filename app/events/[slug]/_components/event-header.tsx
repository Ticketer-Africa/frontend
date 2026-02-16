// _components/event-header-v3.tsx
import Image from "next/image";
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
    <div className="relative">
      {event.bannerUrl && (
        <div className="relative h-64 sm:h-80 lg:h-[420px] overflow-hidden rounded-b-3xl">
          <Image
            src={event.bannerUrl}
            alt={event.name}
            fill
            className="object-cover brightness-[0.92] scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-10">
        <div className="max-w-4xl mx-auto bg-background/90 backdrop-blur-md border rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
            {event.name}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Meta
              icon={<Calendar className="h-5 w-5 text-blue-500" />}
              label="Date & Time"
              value={`${dateStr} • ${timeStr}`}
            />
            <Meta
              icon={<MapPin className="h-5 w-5 text-blue-500" />}
              label="Location"
              value={event.location}
            />
            {/* Add more if needed */}
          </div>
        </div>
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
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 text-base font-medium">{value}</div>
      </div>
    </div>
  );
}
