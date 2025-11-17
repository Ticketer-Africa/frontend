import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../lib/provider";
import { Header } from "@/components/layout/header";
import Head from "./head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticketer Africa - Buy and Sell Event Tickets Effortlessly",
  description:
    "Discover events, buy tickets, resell securely, and explore amazing moments across Africa — all on Ticketer Africa.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  alternates: {
    canonical: "https://ticketer.africa",
  },
  openGraph: {
    title: "Ticketer Africa - Event Ticketing Platform",
    description:
      "Buy. Sell. Enjoy events effortlessly. Explore events and resell tickets with ease.",
    url: "https://ticketer.africa",
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
    title: "Ticketer Africa - Event Ticketing Platform",
    description: "Discover and buy tickets for events across Africa.",
    images: ["https://ticketer.africa/logo.png"],
  },
  keywords: [
    "event ticketing",
    "book tickets",
    "event management",
    "ticket booking platform",
    "discover events",
  ],
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
      <Head />
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
