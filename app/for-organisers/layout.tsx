import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Event Tickets Online in Nigeria | Ticketer Africa",
  description:
    "Create events, sell tickets, manage attendees and check guests in with Ticketer Africa's simple event ticketing platform.",
  alternates: {
    canonical: "https://ticketer.africa/for-organisers",
  },
  openGraph: {
    title: "From Setup to Sold Out | Ticketer Africa for Organisers",
    description:
      "Create events, sell tickets, manage attendees and check guests in with Ticketer Africa's simple event ticketing platform.",
    url: "https://ticketer.africa/for-organisers",
    siteName: "Ticketer Africa",
    type: "website",
    images: [
      {
        url: "https://ticketer.africa/og_image.png",
        width: 1200,
        height: 630,
        alt: "Ticketer Africa for Organisers - From Setup to Sold Out",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "From Setup to Sold Out | Ticketer Africa for Organisers",
    description:
      "Create events, sell tickets, manage attendees and check guests in with Ticketer Africa's simple event ticketing platform.",
    images: ["https://ticketer.africa/og_image.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
