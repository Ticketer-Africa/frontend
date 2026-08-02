export type EventStatus = "LIVE" | "DRAFT" | "ENDED";

export function getEventStatus(event: {
  isActive: boolean;
  date: string;
}): EventStatus {
  if (!event.isActive) return "DRAFT";
  if (new Date(event.date) < new Date()) return "ENDED";
  return "LIVE";
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  LIVE: "Live",
  DRAFT: "Draft",
  ENDED: "Ended",
};

export const EVENT_STATUS_BADGE_CLASS: Record<EventStatus, string> = {
  LIVE: "bg-green-400/15 text-green-200 ring-1 ring-green-300/30",
  DRAFT: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30",
  ENDED: "bg-white/10 text-[var(--home-muted)] ring-1 ring-white/10",
};
