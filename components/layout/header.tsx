"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Wallet,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Resale Market", href: "/resale" },
  ];

  const userNavigation = user
    ? [
        { name: "My Tickets", href: "/my-tickets", icon: Calendar },
        { name: "Settings", href: "/settings", icon: Settings },
      ]
    : [];

  const organizerNavigation =
    user?.role === "ORGANIZER"
      ? [
          { name: "Dashboard", href: "/organizer", icon: Calendar },
          { name: "Wallet", href: "/wallet", icon: Wallet },
          {
            name: "Create Event",
            href: "/organizer/create-event",
            icon: Calendar,
          },
        ]
      : [];

  const adminNavigation =
    user?.role === "ADMIN" || user?.role === "SUPERADMIN"
      ? [{ name: "Admin Dashboard", href: "/admin/dashboard", icon: Settings }]
      : [];

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-100/20 sticky top-0 z-50">
      {/* Animated BG Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? "text-[#1E88E5] border-b-2 border-[#1E88E5]"
                    : "text-gray-700 hover:text-[#1E88E5]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full px-4 py-2 transition-all duration-300"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.profileImage ?? undefined}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    ></AvatarImage>
                    <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
                      {user.profileImage || user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </Button>

                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100/20 rounded-xl shadow-xl py-2 z-50"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.profileImage ?? undefined}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        ></AvatarImage>
                        <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
                          {user.profileImage || user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {[
                      ...userNavigation,
                      ...organizerNavigation,
                      ...adminNavigation,
                    ].map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                        {item.name}
                      </Link>
                    ))}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-[#1E88E5]"
                  asChild
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-700 hover:bg-gray-100 rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100/20 py-4"
          >
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 text-sm font-semibold rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-[#1E88E5]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#1E88E5]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <>
                  <hr className="my-2 border-gray-100" />
                  <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.profileImage ?? undefined}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      ></AvatarImage>
                      <AvatarFallback className="bg-blue-100 text-[#1E88E5] text-sm">
                        {user.profileImage || user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  {[
                    ...userNavigation,
                    ...organizerNavigation,
                    ...adminNavigation,
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1E88E5] rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1E88E5] rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2 border-gray-100" />
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#1E88E5] rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-3 text-sm font-semibold bg-[#1E88E5] hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
}
