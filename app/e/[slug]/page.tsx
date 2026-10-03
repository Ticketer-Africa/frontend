import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventSiteView } from "@/components/event-sites/event-site-view";
import { VisitTracker } from "@/components/event-sites/visit-tracker";
import { text, type PublicSite } from "@/components/event-sites/model";

async function loadSite(slug: string): Promise<PublicSite | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;
  const response = await fetch(`${base.replace(/\/$/, "")}/v1/public/event-sites/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const site = await loadSite(params.slug);
  if (!site) return { title: "Event Site unavailable", robots: { index: false } };
  return {
    title: text(site.document.seo.title) || site.document.name,
    description: text(site.document.seo.description),
    openGraph: { images: text(site.document.seo.imageUrl) ? [text(site.document.seo.imageUrl)] : [] },
    alternates: { canonical: `/e/${site.slug}` },
  };
}

export default async function EventSitePage({ params }: { params: { slug: string } }) {
  const site = await loadSite(params.slug);
  if (!site) notFound();
  return <><EventSiteView document={site.document} target={site.ticketTarget} editions={site.editions} slug={site.slug} /><VisitTracker slug={site.slug} apiBase={process.env.NEXT_PUBLIC_API_BASE_URL || ""} /></>;
}
