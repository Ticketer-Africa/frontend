import { Metadata } from "next";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

async function getEvent(slug: string) {
  try {
    const isDevelopment = process.env.NODE_ENV === "development";
    const apiUrl = isDevelopment
      ? "https://apistaging.ticketer.africa/v1"
      : "https://api.ticketer.africa/v1";
    const url = `${apiUrl}/events/slug/${slug}`;

    const response = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Try to fetch event data, but don't fail if it's not available
  const event = await getEvent(params.id);

  // Provide generic but useful metadata if event not loaded yet
  if (!event) {
    return {
      title: "Event Details - Ticketer Africa",
      description:
        "Discover and book tickets for amazing events across Africa on Ticketer Africa - Your trusted event ticketing platform.",
      keywords: "event tickets, buy tickets, African events, Ticketer Africa",
      alternates: {
        canonical: `https://ticketer.africa/events/${params.id}`,
      },
      openGraph: {
        title: "Event Details - Ticketer Africa",
        description:
          "Discover and book tickets for amazing events across Africa.",
        url: `https://ticketer.africa/events/${params.id}`,
        siteName: "Ticketer Africa",
        images: [
          {
            url: "https://ticketer.africa/og_image.png",
            width: 1200,
            height: 630,
            alt: "Ticketer Africa - Event Ticketing Platform",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Event Details - Ticketer Africa",
        description:
          "Discover and book tickets for amazing events across Africa.",
        images: ["https://ticketer.africa/og_image.png"],
        creator: "@TicketerAfrica",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const eventName = event.title || event.name || "Event";

  const description = event.description
    ? event.description.substring(0, 155) + "..."
    : `Join us for ${eventName} on ${formattedDate} at ${event.location}. Book your tickets now on Ticketer Africa.`;

  const eventTitle = `${eventName} - ${formattedDate} | Ticketer Africa`;

  const keywords = [
    eventName,
    event.category,
    "event tickets",
    "buy tickets",
    event.location,
    "Ticketer Africa",
    "African events",
    formattedDate,
  ];

  return {
    title: eventTitle,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical: `https://ticketer.africa/events/${event.slug}`,
    },
    openGraph: {
      title: eventTitle,
      description,
      url: `https://ticketer.africa/events/${event.slug}`,
      siteName: "Ticketer Africa",
      images: [
        {
          url: event.bannerUrl || "https://ticketer.africa/og_image.png",
          width: 1200,
          height: 630,
          alt: eventName,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: eventTitle,
      description,
      images: [event.bannerUrl || "https://ticketer.africa/og_image.png"],
      creator: "@TicketerAfrica",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
