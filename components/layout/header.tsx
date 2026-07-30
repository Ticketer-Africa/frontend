"use client";

import {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon, Cancel01Icon, DashboardSquare01Icon, Logout03Icon, Menu01Icon, Settings01Icon, Wallet01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { useUser, useAuthStatus } from "@/lib/auth-context";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "For Organisers", href: "/for-organisers" },
] as const;

const DARK_ROUTES = [
  "/",
  "/explore",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/resale",
  "/for-organisers",
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isHome =
    DARK_ROUTES.includes(pathname) ||
    pathname.startsWith("/events/") ||
    pathname.startsWith("/resale/") ||
    pathname.startsWith("/ticket/") ||
    pathname.startsWith("/organizer/") ||
    pathname.startsWith("/dev/layout-previews/") ||
    [
      "/organizer",
      "/wallet",
      "/settings",
      "/verify-otp",
      "/verify-ticket",
      "/terms",
      "/service-agreement",
    ].includes(pathname);
  const { user, logout } = useUser();
  const { isLoading: authLoading } = useAuthStatus();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("home-theme", isHome);
    return () => document.body.classList.remove("home-theme");
  }, [isHome]);

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
        { name: "Settings", href: "/settings", icon: Settings01Icon },
      ]
    : [];

  const organizerNavigation =
    user?.role === "ORGANIZER"
      ? [
          { name: "Dashboard", href: "/organizer", icon: DashboardSquare01Icon },
          { name: "Wallet", href: "/wallet", icon: Wallet01Icon },
          {
            name: "Create Event",
            href: "/organizer/create-event",
            icon: Calendar01Icon,
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
      <div className={isHome ? "px-4 sm:px-6 lg:px-8" : "container mx-auto px-4"}>
        <div className={isHome ? "max-w-7xl mx-auto" : undefined}>
        <div className="grid h-[60px] grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link href="/" className="flex items-center">
            <Logo
              size="md"
              showImage={!isHome}
              textClassName={
                isHome
                  ? "text-[var(--home-text-highlight)] font-['Syne'] text-[28px] tracking-[-0.8px]"
                  : undefined
              }
            />
          </Link>

          <div className="hidden min-w-0 items-center justify-center gap-4 md:flex">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "inline-flex h-11 items-center text-sm transition-colors",
                    isHome
                      ? clsx(
                          "font-['Hanken_Grotesk'] font-semibold text-base tracking-[0.5px]",
                          isActive(item.href)
                            ? "text-[var(--home-text-highlight)]"
                            : "text-[var(--home-muted)] hover:text-[var(--home-text-highlight)]"
                        )
                      : clsx(
                          "rounded-full px-4",
                          isActive(item.href)
                            ? "bg-primary/10 text-[#1E88E5]"
                            : "text-muted-foreground hover:text-[#1E88E5]"
                        )
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
                      "h-11 gap-2 px-4 rounded-[20px]",
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
                            style={isHome ? { borderColor: "var(--home-border)" } : undefined}
                          >
                            <span
                              className="activity-row-icon"
                              style={isHome ? { borderColor: "var(--home-border)" } : undefined}
                            >
                              <HugeiconsIcon
                                icon={item.icon}
                                className="h-4 w-4"
                                style={{ color: isHome ? "var(--home-text-highlight)" : "#1E88E5" }}
                              />
                            </span>
                            <span
                              className="text-sm"
                              style={{ color: isHome ? "var(--home-text)" : undefined }}
                            >
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={handleLogout}
                        className={clsx(
                          "mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 px-5 py-3 text-sm transition-colors",
                          isHome
                            ? "border-[var(--home-border-strong)] hover:bg-[var(--home-card)]"
                            : "border-input hover:bg-accent"
                        )}
                        style={{ color: isHome ? "var(--home-text)" : undefined }}
                      >
                        <HugeiconsIcon icon={Logout03Icon} className="h-4 w-4" />
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
                className="border h-auto rounded-[20px] px-8 py-3 text-base leading-[16px] tracking-[0.5px]"
                style={{ borderColor: "var(--home-accent-fg)" }}
              >
                <Link href="/login">Sign In</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild className="rounded-[20px]">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button variant="primary" asChild className="rounded-[20px]">
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
            {isMenuOpen ? <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" /> : <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div
            className={clsx(
              "mobile-menu-slide-in border-t py-4 md:hidden",
              isHome
                ? "border-[var(--home-border)] bg-[var(--home-bg)]"
                : "border-border bg-background"
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
                      style={isHome ? { borderColor: "var(--home-border)" } : undefined}
                    >
                      <span
                        className="activity-row-icon"
                        style={isHome ? { borderColor: "var(--home-border)" } : undefined}
                      >
                        <HugeiconsIcon
                          icon={item.icon}
                          className="h-4 w-4"
                          style={{ color: isHome ? "var(--home-text-highlight)" : "#1E88E5" }}
                        />
                      </span>
                      <div className="flex flex-col">
                        <span
                          className="text-sm"
                          style={{ color: isHome ? "var(--home-text)" : undefined }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: isHome ? "var(--home-muted)" : undefined }}
                        >
                          Quick access
                        </span>
                      </div>
                    </Link>
                  )
                )}
                <button
                  onClick={handleLogout}
                  className={clsx(
                    "flex w-full items-center justify-center gap-2 rounded-full border-2 px-5 py-3 text-sm",
                    isHome ? "border-[var(--home-border-strong)]" : "border-input"
                  )}
                  style={{ color: isHome ? "var(--home-text)" : undefined }}
                >
                  <HugeiconsIcon icon={Logout03Icon} className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : isHome ? (
              <div className="mt-3 border-t border-[var(--home-border)] pt-3">
                <Button
                  variant="homeAccent"
                  asChild
                  className="w-full h-auto border rounded-[20px] px-8 py-3 text-base leading-[16px] tracking-[0.5px]"
                  style={{ borderColor: "var(--home-accent-fg)" }}
                >
                  <Link href="/login" onClick={closeMenu}>
                    Sign In
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Button variant="outline" asChild className="rounded-[20px]">
                  <Link href="/login" onClick={closeMenu}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="primary" asChild className="rounded-[20px]">
                  <Link href="/register" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
