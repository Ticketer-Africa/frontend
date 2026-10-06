"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EventSiteView } from "@/components/event-sites/event-site-view";
import type { SitePreview } from "@/components/event-sites/model";
import { getSitePreview } from "@/services/event-sites/event-sites";
import "../../site-builder.css";

export default function EventSiteDraftPreviewPage() {
  const id = String(useParams().id);
  const [site, setSite] = useState<SitePreview | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getSitePreview(id).then(setSite).catch(() => setError(true));
  }, [id]);
  if (error) return <main className="esb-empty" role="alert">This private preview is unavailable.</main>;
  if (!site) return <main className="esb-empty" role="status">Loading draft preview…</main>;
  return <><div className="esb-preview-banner"><strong>Private draft preview</strong><span>Only your workspace can see this version.</span><Link href={`/organizer/event-sites/${encodeURIComponent(id)}`}>Back to builder</Link></div><EventSiteView document={site.document} target={site.ticketTarget} editions={site.editions} preview /></>;
}
