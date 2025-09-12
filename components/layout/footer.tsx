"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start space-y-4 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <Logo />
            </div>
            <p className="text-sm sm:text-base">
              Your gateway to unforgettable experiences. Discover and book
              amazing events worldwide.
            </p>
            <div className="flex justify-center sm:justify-start space-x-3 mt-2">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-[#1E88E5] transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-[#1E88E5]">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              {[
                { href: "/explore", label: "Explore Events" },
                { href: "/organizer", label: "Create Event" },
                { href: "/my-tickets", label: "My Tickets" },
                { href: "/wallet", label: "Wallet" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-[#1E88E5] transition-colors text-sm sm:text-base"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-[#1E88E5]">Support</h3>
            <div className="flex flex-col space-y-2">
              {[
                { href: "/", label: "Help Center" },
                { href: "/", label: "Contact Us" },
                { href: "/", label: "Privacy Policy" },
                { href: "/", label: "Terms of Service" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-[#1E88E5] transition-colors text-sm sm:text-base"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4 text-center sm:text-left">
            <h3 className="font-semibold text-[#1E88E5]">Contact Info</h3>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-center sm:justify-start space-x-2  text-sm sm:text-base">
                <Mail className="h-4 w-4" />
                <span>ticketerafrica@gmail.com</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2  text-sm sm:text-base">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-center sm:justify-between items-center  text-sm">
          <p>© {new Date().getFullYear()} Ticketer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
