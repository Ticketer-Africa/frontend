import { NextResponse } from "next/server";
import sharp from "sharp";
import { getEventBySlugV2 } from "@/services/events/events-v2";
import { seoConfig } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

// Link previews (WhatsApp especially) skip og:images over a few hundred KB and
// fall back to the site icon. Organizer banners are often multi-MB originals,
// so serve a downscaled JPEG of the whole banner instead.
const MAX_DIMENSION = 1200;

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await getEventBySlugV2(params.slug);
    if (!event.bannerUrl) throw new Error("Event has no banner");

    const banner = await fetch(event.bannerUrl, { cache: "no-store" });
    if (!banner.ok) throw new Error(`Banner fetch failed: ${banner.status}`);

    const image = await sharp(Buffer.from(await banner.arrayBuffer()))
      .rotate()
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new NextResponse(image, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error generating event OG image:", error);
    return NextResponse.redirect(seoConfig.defaultImage, 302);
  }
}
