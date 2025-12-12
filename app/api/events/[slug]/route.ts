import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://api.ticketer.africa"
      }/events/slug/${params.slug}`,
      {
        next: {
          revalidate: 300, // Revalidate every 5 minutes
          tags: ["event", `event-${params.slug}`],
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
