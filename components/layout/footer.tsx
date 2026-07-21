"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { Logo } from "./logo";

const PLATFORM_LINKS = [
  { href: "/explore", label: "Find Events" },
  { href: "/organizer/create-event", label: "Create Event" },
  { href: "#", label: "Mobile App" }, // TODO: no mobile app route/link exists yet
] as const;

const SUPPORT_LINKS = [
  { href: "#", label: "Help Center" }, // TODO: no help center route exists yet
  { href: "/terms", label: "Privacy Policy" }, // TODO: no dedicated /privacy route exists yet, points at Terms of Service
  { href: "/terms", label: "Terms of Service" },
  { href: "mailto:ticketerafrica@gmail.com", label: "Contact Us" },
] as const;

const SOCIAL_LINKS = [
  { Icon: Facebook, label: "Facebook", href: "#" },
  { Icon: Instagram, label: "Instagram", href: "#" },
] as const;

export function Footer() {
  return (
    <footer
      className="home-theme border-t"
      style={{
        backgroundColor: "var(--home-bg)",
        borderColor: "var(--home-border-subtle)",
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <Logo showImage={false} textClassName="text-[var(--home-text-highlight)]" />
            <p
              className="font-['Hanken_Grotesk'] text-base max-w-md"
              style={{ color: "var(--home-muted)" }}
            >
              The premium destination for cultural discovery, event
              ticketing, and unforgettable experiences across the African
              continent.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "var(--home-social-bg)" }}
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--home-text)" }} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="font-['Hanken_Grotesk'] font-semibold text-sm tracking-[1.4px] uppercase mb-6"
              style={{ color: "var(--home-text)" }}
            >
              Platform
            </h3>
            <nav className="space-y-4" aria-label="Platform links">
              {PLATFORM_LINKS.map((link, i) => (
                <Link
                  key={`${link.label}-${i}`}
                  href={link.href}
                  className="block font-['Hanken_Grotesk'] text-base transition-colors hover:opacity-80"
                  style={{ color: "var(--home-muted)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3
              className="font-['Hanken_Grotesk'] font-semibold text-sm tracking-[1.4px] uppercase mb-6"
              style={{ color: "var(--home-text)" }}
            >
              Support
            </h3>
            <nav className="space-y-4" aria-label="Support links">
              {SUPPORT_LINKS.map((link, i) => (
                <Link
                  key={`${link.label}-${i}`}
                  href={link.href}
                  className="block font-['Hanken_Grotesk'] text-base transition-colors hover:opacity-80"
                  style={{ color: "var(--home-muted)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div
          className="border-t pt-8 text-center"
          style={{ borderColor: "var(--home-border-subtle)" }}
        >
          <p
            className="font-['Hanken_Grotesk'] font-semibold text-sm tracking-[0.7px]"
            style={{ color: "var(--home-muted-dim)" }}
          >
            © {new Date().getFullYear()} Ticketer Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
