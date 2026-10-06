"use client";

import { useEffect, useState } from "react";

export function EventCountdown({ startsAt, eventName }: { startsAt: string | null; eventName: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (!startsAt) return;
    const update = () => setRemaining(Math.max(0, new Date(startsAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startsAt]);
  if (!startsAt) return <p className="es-muted">New dates will be announced soon.</p>;
  if (remaining === null) return <p className="es-muted">Loading countdown…</p>;
  if (remaining <= 0) return <p className="es-muted">{eventName || "The event"} has started.</p>;
  const totalSeconds = Math.floor(remaining / 1000);
  const values = [Math.floor(totalSeconds / 86400), Math.floor(totalSeconds / 3600) % 24, Math.floor(totalSeconds / 60) % 60, totalSeconds % 60];
  return <div className="es-countdown" role="timer" aria-label={`Time until ${eventName || "the next edition"}`}>
    {values.map((value, index) => <div key={index}><strong>{String(value).padStart(2, "0")}</strong><span>{["Days", "Hours", "Minutes", "Seconds"][index]}</span></div>)}
  </div>;
}
