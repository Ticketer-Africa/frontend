import Script from "next/script";

interface EventStructuredDataProps {
  event: {
    title: string;
    description: string;
    date: string;
    location: string;
    bannerUrl?: string;
    slug: string;
    category: string;
    ticketCategories?: Array<{
      price: number;
      name: string;
      maxTickets: number;
      minted: number;
    }>;
  };
}

export function EventStructuredData({ event }: EventStructuredDataProps) {
  const eventDate = new Date(event.date);

  // Calculate lowest and highest ticket prices
  const ticketPrices = event.ticketCategories?.map((tc) => tc.price) || [];
  const lowestPrice = ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0;
  const highestPrice = ticketPrices.length > 0 ? Math.max(...ticketPrices) : 0;

  // Calculate availability
  const totalTickets =
    event.ticketCategories?.reduce((sum, tc) => sum + tc.maxTickets, 0) || 0;
  const soldTickets =
    event.ticketCategories?.reduce((sum, tc) => sum + tc.minted, 0) || 0;
  const availability = soldTickets >= totalTickets ? "SoldOut" : "InStock";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: eventDate.toISOString(),
    endDate: eventDate.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.location,
        addressCountry: "Africa",
      },
    },
    image: [event.bannerUrl || "https://ticketer.africa/logo.png"],
    organizer: {
      "@type": "Organization",
      name: "Ticketer Africa",
      url: "https://ticketer.africa",
    },
    offers: {
      "@type": "AggregateOffer",
      url: `https://ticketer.africa/events/${event.slug}`,
      priceCurrency: "NGN",
      lowPrice: lowestPrice,
      highPrice: highestPrice > lowestPrice ? highestPrice : lowestPrice,
      availability: `https://schema.org/${availability}`,
      validFrom: new Date().toISOString(),
    },
    performer: {
      "@type": "Organization",
      name: "Ticketer Africa",
    },
  };

  return (
    <Script
      id="event-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Organization structured data for the main site
export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ticketer Africa",
    url: "https://ticketer.africa",
    logo: "https://ticketer.africa/og_image.png",
    description:
      "Africa's leading event ticketing platform. Buy and sell event tickets effortlessly.",
    sameAs: [
      "https://twitter.com/TicketerAfrica",
      "https://instagram.com/ticketer.africa",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "ticketerafrica@gmail.com",
    },
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Breadcrumb structured data
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Website structured data
export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ticketer Africa",
    url: "https://ticketer.africa",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://ticketer.africa/explore?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
