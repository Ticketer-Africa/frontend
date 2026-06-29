"use client";

import {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Settings, Wallet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Resale Market", href: "/resale" },
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

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

  const isActive = useCallback(
    (href: string) => {
      if (href.startsWith("#")) return false;
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  }, [logout]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const closeProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto px-4">
        <div className="grid h-[60px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          <div className="hidden min-w-0 items-center gap-4 md:flex">
            <nav className="flex items-center gap-2">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-[#1E88E5]"
                      : "text-muted-foreground hover:text-[#1E88E5]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <div className="relative" ref={profileRef}>
                  <Button
                    variant="outline"
                    className="h-11 gap-2 px-4"
                    onClick={toggleProfile}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profileImage ?? undefined}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs">
                        {user.profileImage || user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                  </Button>

                  {isProfileOpen && (
                    <div className="dropdown-fade-in absolute right-0 mt-2 w-64 rounded-xl border border-border bg-background p-2 shadow-sm">
                      <div className="mb-2 rounded-lg border border-border p-3">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        {[
                          ...userNavigation,
                          ...organizerNavigation,
                          ...adminNavigation,
                        ].map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="activity-row"
                            onClick={closeProfile}
                          >
                            <span className="activity-row-icon">
                              <item.icon className="h-4 w-4 text-[#1E88E5]" />
                            </span>
                            <span className="text-sm text-foreground">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-input px-5 py-3 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="ml-auto md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="mobile-menu-slide-in border-t border-border py-4 md:hidden">
            <nav className="space-y-2">
              {NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex h-11 items-center rounded-full px-4 text-sm ${
                    isActive(item.href)
                      ? "bg-primary/10 text-[#1E88E5]"
                      : "text-muted-foreground"
                  }`}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {user ? (
              <div className="mt-3 space-y-2 border-t border-border pt-3">
                {[...userNavigation, ...organizerNavigation, ...adminNavigation].map(
                  (item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="activity-row"
                      onClick={closeMenu}
                    >
                      <span className="activity-row-icon">
                        <item.icon className="h-4 w-4 text-[#1E88E5]" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{item.name}</span>
                        <span className="text-xs text-muted-foreground">Quick access</span>
                      </div>
                    </Link>
                  )
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-input px-5 py-3 text-sm text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={closeMenu}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/register" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(Header);
