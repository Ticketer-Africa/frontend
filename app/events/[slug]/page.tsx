import type { Metadata } from "next";
import { getEventBySlugV2 } from "@/services/events/events-v2";
import { generateCanonicalUrl, seoConfig, truncateDescription } from "@/lib/seo-utils";
import EventPageClient from "./EventPageClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const event = await getEventBySlugV2(params.slug);
    const title = `${event.name} | ${seoConfig.siteName}`;
    const description = truncateDescription(
      event.description || seoConfig.defaultDescription
    );
    const image = event.bannerUrl || seoConfig.defaultImage;
    const url = generateCanonicalUrl(`/events/${event.slug}`);

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: event.name,
        description,
        url,
        siteName: seoConfig.siteName,
        type: "website",
        images: [{ url: image, width: 1200, height: 630, alt: event.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: event.name,
        description,
        images: [image],
      },
    };
  } catch {
    // Event not found or API unreachable — fall back to the root layout's
    // site-wide metadata rather than failing the page render.
    return {};
  }
}

export default function EventPage({ params }: { params: { slug: string } }) {
  return <EventPageClient slug={params.slug} />;
}
