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
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Resale Market", href: "/resale" },
] as const;

// Round 2: dark theme extends beyond "/" to these public-facing pages.
// Every other route (My Tickets, Organizer, Wallet, Settings, Terms, etc.) stays light.
const DARK_ROUTES = [
  "/",
  "/explore",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/resale",
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = DARK_ROUTES.includes(pathname) || pathname.startsWith("/events/");
  const { user, logout } = useUser();
  const { isLoading: authLoading } = useAuthStatus();
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

  // Nav items shown: on Home, include Resale Market to match Figma; elsewhere keep the original two.
  const navItems = isHome ? NAVIGATION : NAVIGATION.slice(0, 2);

  return (
    <header
      className={clsx(
        "top-0 z-50 border-b",
        isHome
          ? "home-theme absolute w-full border-transparent bg-transparent"
          : "sticky border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="grid h-[60px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="flex items-center">
            <Logo
              size="md"
              showImage={!isHome}
              textClassName={isHome ? "text-[var(--home-text-highlight)]" : undefined}
            />
          </Link>

          <div className="hidden min-w-0 items-center justify-center gap-4 md:flex">
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    isHome
                      ? isActive(item.href)
                        ? "text-[var(--home-text-highlight)]"
                        : "text-[var(--home-muted)] hover:text-[var(--home-text-highlight)]"
                      : isActive(item.href)
                        ? "bg-primary/10 text-[#1E88E5]"
                        : "text-muted-foreground hover:text-[#1E88E5]"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {authLoading ? (
              <div
                className={clsx(
                  "h-11 w-32 animate-pulse rounded-full",
                  isHome ? "bg-[var(--home-card)]" : "bg-muted"
                )}
              />
            ) : user ? (
              <>
                <div className="relative" ref={profileRef}>
                  <Button
                    variant="outline"
                    className={clsx(
                      "h-11 gap-2 px-4",
                      isHome && "border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)]"
                    )}
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
                    <div
                      className={clsx(
                        "dropdown-fade-in absolute right-0 mt-2 w-64 rounded-xl border p-2 shadow-sm",
                        isHome
                          ? "border-[var(--home-border)] bg-[var(--home-card-elevated)]"
                          : "border-border bg-background"
                      )}
                    >
                      <div
                        className={clsx(
                          "mb-2 rounded-lg border p-3",
                          isHome ? "border-[var(--home-border)]" : "border-border"
                        )}
                      >
                        <p className={clsx("text-sm font-medium", isHome ? "text-[var(--home-text)]" : "text-foreground")}>
                          {user.name}
                        </p>
                        <p className={clsx("text-xs", isHome ? "text-[var(--home-muted)]" : "text-muted-foreground")}>
                          {user.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {[
                          ...userNavigation,
                          ...organizerNavigation,
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
            ) : isHome ? (
              <Button
                variant="homeAccent"
                asChild
                className="border"
                style={{ borderColor: "var(--home-accent-fg)" }}
              >
                <Link href="/login">Sign In</Link>
              </Button>
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
            className={clsx(
              "ml-auto md:hidden",
              isHome && "border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)]"
            )}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div
            className={clsx(
              "mobile-menu-slide-in border-t py-4 md:hidden",
              isHome ? "border-[var(--home-border)]" : "border-border"
            )}
          >
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "flex h-11 items-center rounded-full px-4 text-sm",
                    isHome
                      ? isActive(item.href)
                        ? "text-[var(--home-text-highlight)]"
                        : "text-[var(--home-muted)]"
                      : isActive(item.href)
                        ? "bg-primary/10 text-[#1E88E5]"
                        : "text-muted-foreground"
                  )}
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {user ? (
              <div
                className={clsx(
                  "mt-3 space-y-2 border-t pt-3",
                  isHome ? "border-[var(--home-border)]" : "border-border"
                )}
              >
                {[...userNavigation, ...organizerNavigation].map(
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
            ) : isHome ? (
              <div className="mt-3 border-t border-[var(--home-border)] pt-3">
                <Button
                  variant="homeAccent"
                  asChild
                  className="w-full border"
                  style={{ borderColor: "var(--home-accent-fg)" }}
                >
                  <Link href="/login" onClick={closeMenu}>
                    Sign In
                  </Link>
                </Button>
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
