// SEO utility functions for Ticketer Africa

export const seoConfig = {
  siteName: "Ticketer Africa",
  siteUrl: "https://ticketer.africa",
  defaultTitle: "Ticketer Africa - Buy and Sell Event Tickets Effortlessly",
  defaultDescription:
    "Discover events, buy tickets, resell securely, and explore amazing moments across Africa — all on Ticketer Africa.",
  defaultImage: "https://ticketer.africa/logo.png",
  twitterHandle: "@TicketerAfrica",
};

// Generate page title with template
export function generatePageTitle(title: string): string {
  if (!title) return seoConfig.defaultTitle;
  return `${title} | ${seoConfig.siteName}`;
}

// Truncate description to optimal length for SEO
export function truncateDescription(
  description: string,
  maxLength: number = 155
): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3) + "...";
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${seoConfig.siteUrl}${cleanPath}`;
}

// Extract location from event location string
export function extractLocation(location: string): {
  city?: string;
  country?: string;
} {
  if (!location) return {};

  const parts = location.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return {
      city: parts[0],
      country: parts[parts.length - 1],
    };
  }

  return { city: location };
}

// Generate keywords from event data
export function generateEventKeywords(event: {
  title: string;
  category: string;
  location: string;
}): string[] {
  const baseKeywords = [
    "event tickets",
    "buy tickets",
    "Ticketer Africa",
    "African events",
  ];

  const eventKeywords = [
    event.title,
    event.category,
    `${event.category} tickets`,
    event.location,
    `events in ${event.location}`,
  ];

  return [...eventKeywords, ...baseKeywords];
}

// Format event date for SEO
export function formatEventDateForSEO(date: string | Date): string {
  const eventDate = new Date(date);
  return eventDate.toISOString();
}

// Calculate event status
export function getEventStatus(
  date: string | Date
): "upcoming" | "ongoing" | "past" {
  const eventDate = new Date(date);
  const now = new Date();

  if (eventDate > now) return "upcoming";
  if (eventDate.toDateString() === now.toDateString()) return "ongoing";
  return "past";
}

// Generate social sharing text
export function generateShareText(event: {
  title: string;
  date: string;
  location: string;
}): string {
  const date = new Date(event.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `Check out ${event.title} on ${formattedDate} at ${event.location}! Get your tickets on Ticketer Africa.`;
}

// Clean and optimize image URLs for SEO
export function optimizeImageUrl(
  url: string | undefined,
  fallback: string = seoConfig.defaultImage
): string {
  if (!url) return fallback;

  // Add image optimization parameters if using a CDN
  // Example: cloudinary, imgix, etc.
  return url;
}

// Generate breadcrumb structured data
export function generateBreadcrumbs(
  items: Array<{ name: string; path: string }>
) {
  return items.map((item, index) => ({
    name: item.name,
    url: generateCanonicalUrl(item.path),
    position: index + 1,
  }));
}

// Validate and clean URL slug
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Generate meta robots content
export function generateRobotsContent(
  options: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
  } = {}
): string {
  const {
    index = true,
    follow = true,
    noarchive = false,
    nosnippet = false,
  } = options;

  const parts: string[] = [];
  parts.push(index ? "index" : "noindex");
  parts.push(follow ? "follow" : "nofollow");
  if (noarchive) parts.push("noarchive");
  if (nosnippet) parts.push("nosnippet");

  return parts.join(", ");
}

// Performance tracking
export function reportWebVitals(metric: any) {
  // Send to analytics endpoint
  if (process.env.NODE_ENV === "production") {
    // Example: Send to Google Analytics, Vercel Analytics, etc.
    console.log(metric);

    // You can integrate with your analytics service here
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // });
  }
}
