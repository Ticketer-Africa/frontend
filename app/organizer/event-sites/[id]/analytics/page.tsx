"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteAnalytics } from "@/components/event-sites/site-analytics";
import { getSiteAnalytics } from "@/services/event-sites/event-sites";
import "../../site-builder.css";

type Report = { windowDays: number; uniqueVisitors: number; pageViews: number; ticketCtaClicks: number };

export default function EventSiteAnalyticsPage() {
  const id = String(useParams().id);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getSiteAnalytics(id).then(setReport).catch(() => setError(true));
  }, [id]);
  return <main className="esb-shell esb-report">
    <Link href={`/organizer/event-sites/${encodeURIComponent(id)}`}>← Back to builder</Link>
    <h1>Event Site analytics</h1>
    {error ? <p role="alert">Could not load this site’s analytics.</p> : report ? <SiteAnalytics {...report} /> : <p role="status">Loading analytics…</p>}
  </main>;
}
