import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the web vitals metric
    console.log("Web Vital:", {
      name: body.name,
      value: body.value,
      rating: body.rating,
      timestamp: new Date().toISOString(),
    });

    // Here you can send to your analytics service
    // Examples: Google Analytics, Vercel Analytics, Custom analytics endpoint

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging web vitals:", error);
    return NextResponse.json(
      { error: "Failed to log metrics" },
      { status: 500 }
    );
  }
}
