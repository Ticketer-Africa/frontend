import type React from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "../lib/provider";
import { Header } from "@/components/layout/header";
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from "@/components/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL("https://ticketer.africa"),
  title: {
    default: "Ticketer Africa - Buy and Sell Event Tickets Effortlessly",
    template: "%s | Ticketer Africa",
  },
  description:
    "Discover events, buy tickets, resell securely, and explore amazing moments across Africa — all on Ticketer Africa. Safe, fast, and verified ticketing platform.",
  applicationName: "Ticketer Africa",
  authors: [{ name: "Ticketer Africa" }],
  generator: "Next.js",
  keywords: [
    "event ticketing Africa",
    "buy event tickets",
    "sell event tickets",
    "event management",
    "ticket booking platform",
    "discover events",
    "African events",
    "concert tickets",
    "festival tickets",
    "conference tickets",
    "ticket resale marketplace",
    "verified tickets",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Ticketer Africa",
  publisher: "Ticketer Africa",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://ticketer.africa",
  },
  openGraph: {
    title: "Ticketer Africa - Event Ticketing Platform",
    description:
      "Buy. Sell. Enjoy events effortlessly. Explore events and resell tickets with ease on Africa's leading ticketing platform.",
    url: "https://ticketer.africa",
    siteName: "Ticketer Africa",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://ticketer.africa/og_image.png",
        width: 1200,
        height: 630,
        alt: "Ticketer Africa - Event Ticketing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ticketer Africa - Event Ticketing Platform",
    description:
      "Discover and buy tickets for events across Africa. Safe, secure, and verified.",
    images: ["https://ticketer.africa/og_image.png"],
    creator: "@TicketerAfrica",
    site: "@TicketerAfrica",
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
  verification: {
    google: "eSIkb-QiBu3FEf4pafVtK3nTZTFTpDLOOCCMc7r8q1I",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E88E5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
       * Performance: Structured data moved to head via JSON-LD script tags
       * This prevents them from being in the render tree and blocking paint
       */}
      <head>
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-grotesk@400,500,600,700&display=swap"
        />
      </head>
      <body className="antialiased">
        {/* Structured data rendered as script tags - doesn't block paint */}
        <OrganizationStructuredData />
        <WebsiteStructuredData />
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
