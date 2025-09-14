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
import { Button } from "@/components/ui/button"
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-black text-white">
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
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="p-2 rounded-full bg-white/10">
                    <Icon className="h-5 w-5 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              {[
                { href: "/explore", label: "Explore Events" },
                { href: "/organizer", label: "Create Event" },
                { href: "/my-tickets", label: "My Tickets" },
                { href: "/wallet", label: "Wallet" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2 text-sm">
              {[
                { href: "/", label: "Help Center" },
                { href: "/", label: "Contact Us" },
                { href: "/", label: "Privacy Policy" },
                { href: "/", label: "Terms of Service" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>ticketerafrica@gmail.com</span>
                <span className="text-sm">ticketerafrica@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} Ticketer. All rights reserved.</p>
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-[#1E88E5] text-sm">
            © {new Date().getFullYear()} Ticketer. All rights reserved.
          </p>
        </div>
      </div>
      </div>
    </footer>
  );
}
