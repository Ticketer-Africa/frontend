"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Shield,
  Users,
  Calendar,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // In a real app, this would handle logout logic
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#1E88E5] to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#1E88E5] to-indigo-600 bg-clip-text text-transparent">
              Ticketer Africa Admin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/admin/dashboard"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/users"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/events"
              className="text-foreground hover:text-primary transition-colors flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>
          </nav>

          {/* Desktop Admin Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-[#1E88E5]" />
              <span className="text-sm font-medium">Admin Portal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <span>Back to Site</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t py-4"
          >
            <nav className="flex flex-col space-y-4">
              <Link
                href="/admin/dashboard"
                className="text-foreground hover:text-primary transition-colors flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/users"
                className="text-foreground hover:text-primary transition-colors flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
              <Link
                href="/admin/events"
                className="text-foreground hover:text-primary transition-colors flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-4 w-4" />
                <span>Events</span>
              </Link>

              {/* Mobile Admin Actions */}
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-4 w-4 text-[#1E88E5]" />
                  <span className="text-sm font-medium">Admin Portal</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild className="flex-1">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                      Back to Site
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
