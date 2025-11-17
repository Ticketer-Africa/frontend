import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resale Marketplace - Ticketer Africa",
  description:
    "Buy verified resale tickets or list your unused event tickets safely and securely.",
  alternates: {
    canonical: "https://ticketer.africa/resale",
  },
  openGraph: {
    title: "Resale Marketplace - Ticketer Africa",
    description:
      "List tickets for resale or buy from verified sellers with full security.",
    url: "https://ticketer.africa/resale",
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
    title: "Resale Marketplace - Ticketer Africa",
    description:
      "Buy and sell event tickets in a safe and verified marketplace.",
    images: ["https://ticketer.africa/logo.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
