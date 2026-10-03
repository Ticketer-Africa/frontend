"use client";

import Link from "next/link";

export function TrackedTicketLink({
  href, slug, sectionId, eventId, children,
}: {
  href: string; slug?: string; sectionId: string; eventId: string | null; children: React.ReactNode;
}) {
  function track() {
    if (!slug || !eventId) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    void fetch(`${apiBase.replace(/\/$/, "")}/v1/public/event-sites/${encodeURIComponent(slug)}/click`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ sectionId, eventId, clickId: crypto.randomUUID() }), keepalive: true,
    }).catch(() => {});
  }
  return <Link className="es-button" href={href} onClick={track}>{children}</Link>;
}
