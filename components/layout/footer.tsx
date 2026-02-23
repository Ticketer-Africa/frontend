"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Logo } from "./logo";

/**
 * Static data hoisted outside component
 * Performance: Prevents recreation on every render
 */
const SOCIAL_ICONS = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "YouTube" },
] as const;

const QUICK_LINKS = [
  { href: "/explore", label: "Explore Events" },
  { href: "/organizer", label: "Create Event" },
  { href: "/my-tickets", label: "My Tickets" },
  { href: "/wallet", label: "Wallet" },
] as const;

const SUPPORT_LINKS = [
  { href: "#faq", label: "FAQs" },
  { href: "#pricing", label: "Pricing" },
  { href: "/service-agreement", label: "Service Agreement" },
] as const;

/**
 * Footer - Optimized for performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion animations
 * 2. Static data hoisted outside component
 * 3. CSS hover effects instead of JS animations
 */
export function Footer() {
  return (
    <footer className="bg-white border-t-[1px] text-black">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm">
              Your gateway to unforgettable experiences. Discover and book
              amazing events worldwide.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_ICONS.map(({ Icon, label }) => (
                <button
                  key={label}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm" aria-label="Quick links">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block hover:text-[#1E88E5] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <nav className="space-y-2 text-sm" aria-label="Support links">
              {SUPPORT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block hover:text-[#1E88E5] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <address className="space-y-3 text-sm not-italic">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">ticketerafrica@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>+234 (903) 750-4159</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>
            © {new Date().getFullYear()} Ticketer Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
