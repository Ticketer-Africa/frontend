"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function TrackedTicketLink({
  href, slug, sectionId, eventId, children,
}: {
  href: string; slug?: string; sectionId: string; eventId: string | null; children: React.ReactNode;
}) {
  const router = useRouter();
  async function track(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!slug || !eventId) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const clickId = crypto.randomUUID();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1500);
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, "")}/v1/public/event-sites/${encodeURIComponent(slug)}/click`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ sectionId, eventId, clickId }), keepalive: true, signal: controller.signal,
      });
      const url = new URL(href, window.location.origin);
      if (response.ok) url.searchParams.set("siteClickId", clickId);
      router.push(`${url.pathname}${url.search}`);
    } catch {
      router.push(href);
    } finally {
      window.clearTimeout(timeout);
    }
  }
  return <Link className="es-button" href={href} onClick={event => void track(event)}>{children}</Link>;
}
