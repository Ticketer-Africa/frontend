import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Account - Ticketer Africa",
  description:
    "Register to buy tickets, explore events, and access your personal dashboard.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://ticketer.africa/register",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
