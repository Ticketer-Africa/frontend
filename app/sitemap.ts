// app/sitemap.ts
import { MetadataRoute } from "next";

const baseUrl = "https://ticketer.africa";

async function getAllEvents() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "https://api.ticketer.africa"
      }/events`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch events for sitemap");
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching events for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getAllEvents();

  // Static routes with priorities and change frequencies
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resale`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic event routes
  const eventRoutes: MetadataRoute.Sitemap = events.map((event: any) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: new Date(event.updatedAt || event.createdAt),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...routes, ...eventRoutes];
}
