import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Events - Ticketer Africa",
  description:
    "Browse events happening across Africa. Concerts, festivals, conferences and more — all in one place.",
  alternates: {
    canonical: "https://ticketer.africa/explore",
  },
  openGraph: {
    title: "Explore Events - Ticketer Africa",
    description: "Discover upcoming events near you and across Africa.",
    url: "https://ticketer.africa/explore",
    siteName: "Ticketer Africa",
    type: "website",
    images: [
      {
        url: "https://ticketer.africa/logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Events - Ticketer Africa",
    description:
      "Discover and book tickets for events happening across Africa.",
    images: ["https://ticketer.africa/logo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
