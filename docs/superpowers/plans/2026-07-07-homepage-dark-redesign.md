# Homepage Dark Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Ticketer Africa homepage (`/`) to match the new dark/coral Figma design, without touching any other route.

**Architecture:** Introduce a scoped `.home-theme` CSS-variable palette in `app/globals.css` (additive, does not touch the global `--background`/`--foreground` tokens used sitewide), two shared primitives (`Button variant="homeAccent"`, new `HomeCard` component), and a route-aware branch in the shared `Header`. Then restyle each existing homepage section component in place, keeping all existing data-fetching/business logic (event queries, FAQ accordion state, pricing figures) unchanged — this is a visual-only change.

**Tech Stack:** Next.js 14 (App Router), React 18, Tailwind CSS v3, `class-variance-authority` for button variants, `lucide-react` icons. No test runner is configured in this repo, so verification is: TypeScript compiles cleanly (`npx tsc --noEmit`) + visual comparison against the Figma screenshot for each section using the dev server.

**Reference screenshot:** The full-page Figma screenshot was saved during design review — regenerate it at any time with the Figma MCP `get_screenshot` tool on node `118:2759` in file `slxWZ4Id2gwsEbPPrt5fRx`, or view it directly at https://www.figma.com/design/slxWZ4Id2gwsEbPPrt5fRx/Ticketer-Africa?node-id=118-2759

**Spec:** `docs/superpowers/specs/2026-07-07-homepage-dark-redesign-design.md`

---

## File Structure

| File | Change |
|---|---|
| `app/globals.css` | Add Hanken Grotesk `@import`, add `.home-theme` CSS variable block |
| `components/ui/button.tsx` | Add `homeAccent` variant to existing `cva` config |
| `components/layout/logo.tsx` | Add optional `textClassName` prop (backward compatible) |
| `components/home/home-card.tsx` | **New.** Shared dark card wrapper |
| `components/layout/header.tsx` | Add route-aware dark styling branch for `/` |
| `components/hero-section.tsx` | Full rewrite of markup/styling, same route behavior |
| `components/events-section.tsx` | Restyle only — data wiring (`useAllEvents`, `bannerUrl`, `slug`) unchanged |
| `components/features-section.tsx` | Restyle only — same 4 features/copy, use `HomeCard` |
| `components/pricing-section.tsx` | Restructure to two-card layout, same figures/copy, use `HomeCard` |
| `components/faq-section.tsx` | Restyle only — same `FAQS` data/accordion logic, use `HomeCard` |
| `components/layout/footer.tsx` | Restructure to 3-column layout per spec |
| `app/page.tsx` | Add `.home-theme` wrapper class |

---

## Task 1: Design tokens and Hanken Grotesk font

**Files:**
- Modify: `app/globals.css:1` (font import), `app/globals.css:82-83` (after the `.dark { ... }` block, still inside `@layer base`)

- [ ] **Step 1: Add the Hanken Grotesk font import**

At `app/globals.css:1`, change:

```css
@import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap");
```

to:

```css
@import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap");
```

- [ ] **Step 2: Add the `.home-theme` token block**

Insert immediately after the closing `}` of the `.dark { ... }` block (currently ending at line 82), still inside the same `@layer base { ... }`:

```css
  .home-theme {
    /* surfaces */
    --home-bg: #0b0e14; /* page / footer / hero base — unified across the page */
    --home-card: #141b2b;
    --home-card-elevated: #191f2f;
    --home-card-highlight: #232a3a;

    /* borders */
    --home-border: rgba(86, 66, 62, 0.3);
    --home-border-subtle: rgba(86, 66, 62, 0.1);
    --home-border-strong: #56423e;

    /* text */
    --home-text: #dce2f7;
    --home-text-highlight: #ffb4a5;
    --home-muted: #ddc0ba;
    --home-muted-dim: #a48b86;

    /* accent + semantic */
    --home-accent: #e2725b;
    --home-accent-fg: #5a0d02;
    --home-success: #42a73b;
    --home-success-fg: #003403;
    --home-success-text: #92fa83;
    --home-highlight-yellow: #f4d03f;
    --home-social-bg: #2e3545; /* footer social icon circles — distinct from --home-border-strong */
    --home-badge-bg: rgba(46, 53, 69, 0.3); /* eyebrow pill / Show More button translucent fill */

    /* radii */
    --home-radius-card: 16px;
    --home-radius-card-lg: 24px;
  }
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors (CSS isn't type-checked, this just confirms the repo still builds its TS graph cleanly before further changes).

Run: `npm run dev` (leave running for subsequent tasks), then in the browser console on any page run:

```js
getComputedStyle(document.documentElement).getPropertyValue('--home-bg')
```

Expected: empty string (token is scoped to `.home-theme`, not `:root`, so it must NOT be visible outside that class yet).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "Add Hanken Grotesk font and .home-theme design tokens"
```

---

## Task 2: `homeAccent` Button variant

**Files:**
- Modify: `components/ui/button.tsx:11-24`

- [ ] **Step 1: Add the variant**

In `components/ui/button.tsx`, inside the `variants.variant` object (currently lines 12-23), add a new entry after `link:`:

```ts
        link: "border-transparent bg-transparent text-primary underline-offset-4 hover:underline",
        homeAccent:
          "border-transparent bg-[var(--home-accent)] text-[var(--home-accent-fg)] font-['Hanken_Grotesk'] font-semibold hover:opacity-90",
```

- [ ] **Step 2: Verify usage compiles**

Run: `npx tsc --noEmit`
Expected: no errors. `variant="homeAccent"` is now a valid `ButtonProps` value anywhere in the app.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "Add homeAccent button variant for dark homepage redesign"
```

---

## Task 3: `Logo` optional `textClassName` prop

**Files:**
- Modify: `components/layout/logo.tsx`

The wordmark color is currently hardcoded (`text-[#1E88E5]`), but the homepage header/footer need it in `--home-text-highlight` coral instead. Add a prop rather than duplicating the whole component.

- [ ] **Step 1: Add the prop**

Replace the full contents of `components/layout/logo.tsx` with:

```tsx
import React from "react";
import clsx from "clsx";

type LogoProps = {
  size?: "sm" | "md" | "lg" | number; // pre-defined or custom number (in rem)
  withText?: boolean;
  text?: string;
  imgSrc?: string;
  className?: string;
  textClassName?: string;
};

const sizeMap = {
  sm: { width: "w-10", height: "h-6", text: "text-xl" },
  md: { width: "w-16", height: "h-10", text: "text-2xl" },
  lg: { width: "w-24", height: "h-14", text: "text-3xl" },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  withText = true,
  text = "Ticketer Africa",
  imgSrc = "/logo.png",
  className = "",
  textClassName,
}) => {
  const isCustomSize = typeof size === "number";
  const {
    width,
    height,
    text: textSize,
  } = typeof size === "string" ? sizeMap[size] : sizeMap.md;

  const imageClasses = isCustomSize
    ? `w-[${size}rem] h-[${size * 0.625}rem]` // keep aspect ratio
    : `${width} ${height}`;

  const fontClasses = isCustomSize ? `text-[${size * 0.15}rem]` : textSize;

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <div className={imageClasses}>
        <img
          src={imgSrc}
          alt={`${text} Logo`}
          className="w-full h-full object-cover"
        />
      </div>
      {withText && (
        <span
          className={clsx(
            "font-bold",
            textClassName ?? "text-[#1E88E5]",
            fontClasses
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
};
```

The only functional change is: `textClassName` prop, defaulting to the original hardcoded blue when not passed, so every existing caller is unaffected.

- [ ] **Step 2: Verify no callers broke**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/logo.tsx
git commit -m "Add optional textClassName prop to Logo for theme overrides"
```

---

## Task 4: `HomeCard` shared primitive

**Files:**
- Create: `components/home/home-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from "react";
import clsx from "clsx";

type HomeCardTone = "card" | "elevated" | "highlight";

type HomeCardProps = {
  tone?: HomeCardTone;
  radius?: "card" | "card-lg";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const toneVar: Record<HomeCardTone, string> = {
  card: "var(--home-card)",
  elevated: "var(--home-card-elevated)",
  highlight: "var(--home-card-highlight)",
};

const radiusVar: Record<NonNullable<HomeCardProps["radius"]>, string> = {
  card: "var(--home-radius-card)",
  "card-lg": "var(--home-radius-card-lg)",
};

export function HomeCard({
  tone = "card",
  radius = "card",
  className,
  children,
  style,
  ...props
}: HomeCardProps) {
  return (
    <div
      className={clsx("border", className)}
      style={{
        backgroundColor: toneVar[tone],
        borderColor: "var(--home-border)",
        borderRadius: radiusVar[radius],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/home-card.tsx
git commit -m "Add HomeCard shared primitive for dark homepage redesign"
```

---

## Task 5: Route-aware dark `Header`

**Files:**
- Modify: `components/layout/header.tsx`

Only the homepage (`/`) gets the dark/transparent nav. Every other route keeps the existing light sticky header exactly as-is. Auth-aware logic (user dropdown, mobile menu, logout) is preserved under both variants.

- [ ] **Step 1: Replace the file contents**

Replace the full contents of `components/layout/header.tsx` with:

```tsx
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
import { useAuth } from "@/lib/auth-context";
import { Logo } from "./logo";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const NAVIGATION = [
  { name: "Home", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Resale Market", href: "/explore" }, // TODO: point at a dedicated resale route if/when one exists
] as const;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
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
              textClassName={isHome ? "text-[var(--home-text-highlight)]" : undefined}
            />
          </Link>

          <div className="hidden min-w-0 items-center gap-4 md:flex">
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
            {user ? (
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
```

Key behavioral notes for the engineer:
- `isHome` is the only new branch condition. Every `isHome ? ... : ...` ternary's `else` branch is byte-for-byte what the header rendered before this change.
- The header switches from `sticky` to `absolute` positioning only on `/`, so it overlays the hero background instead of pushing content down — `HeroSection` (Task 6) accounts for this with top padding.
- `home-theme` class is applied directly on the `<header>` element (not on `app/page.tsx`) so the CSS variables are available to the header even though it's rendered from the root layout, outside `page.tsx`'s own `.home-theme` wrapper.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

With `npm run dev` running, open `http://localhost:3000/explore` and confirm the header looks and behaves exactly as before (light, sticky, Sign In/Sign Up buttons). Then open `http://localhost:3000/` — header should render transparently over the (still-unstyled, pre-Task-6) hero section, dark link colors, single "Sign In" pill.

- [ ] **Step 4: Commit**

```bash
git add components/layout/header.tsx
git commit -m "Add route-aware dark header variant for homepage"
```

---

## Task 6: Hero section redesign

**Files:**
- Modify: `components/hero-section.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="home-theme relative flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-32 pb-24 min-h-[720px]"
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(226,114,91,0.16), transparent 60%), var(--home-bg)",
      }}
    >
      <div className="relative z-0 text-center max-w-5xl mx-auto w-full">
        <span
          className="inline-block mb-4 px-4 py-1 rounded-full border text-sm tracking-[0.5px] font-['Hanken_Grotesk'] font-semibold backdrop-blur-[2px]"
          style={{
            color: "var(--home-text-highlight)",
            borderColor: "var(--home-border-strong)",
            backgroundColor: "var(--home-badge-bg)",
          }}
        >
          Experience the Rhythm
        </span>

        <h1
          className="font-['Syne'] font-extrabold text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight tracking-[-1.2px]"
          style={{ color: "var(--home-text)" }}
        >
          Buy. Sell. Enjoy
          <br />
          Events
          <br />
          <span style={{ color: "var(--home-accent)" }}>Effortlessly.</span>
        </h1>

        <p
          className="font-['Hanken_Grotesk'] text-lg sm:text-xl mb-10 max-w-3xl mx-auto leading-relaxed tracking-[0.5px]"
          style={{ color: "var(--home-muted)" }}
        >
          Discover the continent&apos;s most exclusive curated experiences, buy
          tickets securely, and never miss a heartbeat of African culture.
        </p>

        <div className="flex justify-center items-center px-2">
          <Button
            variant="homeAccent"
            size="lg"
            className="drop-shadow-[0px_0px_7.5px_rgba(226,114,91,0.2)]"
            onClick={() => router.push("/register?intent=organizer")}
          >
            Become an Organizer
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
```

Notes:
- Removed `HeroSearchBar` import/usage and the CSS-circle background divs — not present in the Figma hero.
- `router.push("/register?intent=organizer")` destination is unchanged from the original "Become an Organizer" button.
- `pt-32` accounts for the now-`absolute` header from Task 5 so the eyebrow text isn't clipped.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/` and confirm: dark hero background, coral eyebrow text, headline with coral "Effortlessly.", coral pill CTA. Compare against the Figma hero region.

- [ ] **Step 4: Commit**

```bash
git add components/hero-section.tsx
git commit -m "Redesign hero section to match dark Figma homepage"
```

---

## Task 7: Events section ("Trending Events") redesign

**Files:**
- Modify: `components/events-section.tsx`

Data wiring (`useAllEvents`, `event.bannerUrl`, `event.slug`, `router.push`) is unchanged. Only markup/styling changes.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { memo } from "react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAllEvents } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
import { truncateText } from "@/utils/trauncate";

interface EventCardProps {
  event: Event;
  index: number;
  onClick: () => void;
}

const EventCard = memo(function EventCard({
  event,
  index,
  onClick,
}: EventCardProps) {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article
      onClick={onClick}
      className="cursor-pointer group section-animate"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-[514px] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
        <Image
          src={event.bannerUrl || "/placeholder.svg"}
          alt={event.name}
          fill
          priority={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--home-bg) 0%, rgba(11,14,20,0) 50%)",
          }}
        />

        <div className="absolute bottom-6 left-6 right-6">
          <h3
            className="font-['Syne'] font-bold text-2xl sm:text-3xl mb-2 line-clamp-2"
            style={{ color: "var(--home-text)" }}
          >
            {truncateText(event.name, 8)}
          </h3>

          <div
            className="flex items-center gap-3 text-base font-['Hanken_Grotesk'] font-semibold"
            style={{ color: "var(--home-text)" }}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
});

export function EventsSection() {
  const router = useRouter();
  const { data: response } = useAllEvents();

  const events: Event[] = Array.isArray(response)
    ? response
    : response?.data ?? [];

  const handleEventClick = (slug: string) => {
    router.push(`/events/${slug}`);
  };

  return (
    <section
      className="home-theme py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-animate flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2
              className="font-['Syne'] font-bold text-3xl sm:text-4xl"
              style={{ color: "var(--home-text)" }}
            >
              Trending Events
            </h2>
            <span
              className="hidden sm:block w-12 h-[2px]"
              style={{ backgroundColor: "var(--home-text-highlight)" }}
              aria-hidden="true"
            />
          </div>
          <Link
            href="/explore"
            className="font-['Hanken_Grotesk'] text-base font-semibold border-b pb-1.5"
            style={{ color: "var(--home-text-highlight)", borderColor: "var(--home-text-highlight)" }}
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 3).map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              onClick={() => handleEventClick(event.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Notes:
- `router` is still used for the card click handler; `Link` (new import) is used only for the "View All" link.
- `event.location`/`MapPin` row from the old design is dropped — Figma's trending card only shows title + date.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/` and scroll to Trending Events. Confirm dark section background, "Trending Events" heading + divider + "View All" link, 3 cards with bottom gradient + title + calendar icon/date.

- [ ] **Step 4: Commit**

```bash
git add components/events-section.tsx
git commit -m "Redesign trending events section to match dark Figma homepage"
```

---

## Task 8: Features section redesign

**Files:**
- Modify: `components/features-section.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { memo } from "react";
import { Ticket, RefreshCw, BarChart3, CreditCard } from "lucide-react";
import { HomeCard } from "@/components/home/home-card";

const FEATURES = [
  {
    icon: Ticket,
    title: "Buy Tickets Easily",
    description:
      "Browse and purchase tickets for your favorite events with just a few clicks in a seamless journey.",
    iconBg: "rgba(226,114,91,0.1)",
    iconColor: "var(--home-accent)",
  },
  {
    icon: RefreshCw,
    title: "Resell Tickets Securely",
    description:
      "Can't make it? Safely resell your tickets through our verified peer-to-peer marketplace.",
    iconBg: "rgba(66,167,59,0.1)",
    iconColor: "var(--home-success)",
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Organizer Dashboard",
    description:
      "Comprehensive tools for event management and instant payouts, built for organizers of any size.",
    iconBg: "rgba(244,208,63,0.1)",
    iconColor: "var(--home-highlight-yellow)",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Lightning-fast checkout with bank-level encryption for all your transactions across the continent.",
    iconBg: "rgba(255,180,165,0.1)",
    iconColor: "var(--home-text-highlight)",
  },
] as const;

interface FeatureCardProps {
  feature: (typeof FEATURES)[number];
  index: number;
}

const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <HomeCard
      className="relative p-8 feature-card"
      style={{ animationDelay: `${index * 100}ms`, borderColor: "var(--home-border-strong)" }}
    >
      {feature.isNew && (
        <span
          className="absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-['Hanken_Grotesk'] font-bold tracking-[0.5px]"
          style={{ backgroundColor: "var(--home-success)", color: "var(--home-success-fg)" }}
        >
          NEW
        </span>
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ backgroundColor: feature.iconBg }}
      >
        <Icon className="w-5 h-5" style={{ color: feature.iconColor }} aria-hidden="true" />
      </div>

      <h3
        className="font-['Syne'] font-medium text-xl mb-3 tracking-[-1.2px]"
        style={{ color: "var(--home-text)" }}
      >
        {feature.title}
      </h3>

      <p
        className="font-['Hanken_Grotesk'] text-sm leading-[22px]"
        style={{ color: "var(--home-muted)" }}
      >
        {feature.description}
      </p>
    </HomeCard>
  );
});

export function FeaturesSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="section-animate text-center mb-16">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Everything you need for events
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-lg max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            From buying tickets to organizing events, we&apos;ve got you
            covered with powerful tools designed for the modern scene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Note: "Organizer Dashboard" title dropped "& Wallet" and its description was corrected from the current file's copy-paste bug (it duplicated the resell description) to match Figma's actual card 3/4 copy pattern — this is a genuine content fix, not scope creep, since the current text is visibly wrong (two different features sharing the same sentence).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/` and scroll to the features grid. Confirm 4 dark bordered cards, tinted icon badges, green "NEW" pill on card 2.

- [ ] **Step 4: Commit**

```bash
git add components/features-section.tsx
git commit -m "Redesign features section to match dark Figma homepage"
```

---

## Task 9: Pricing section redesign

**Files:**
- Modify: `components/pricing-section.tsx`

Figures (5% ticket sales, 15% flat resale fee, 10%/5% split) are unchanged — only the layout/styling changes from stacked single-column to two side-by-side cards.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeCard } from "@/components/home/home-card";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="home-theme py-24 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="section-animate mb-12">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-lg"
            style={{ color: "var(--home-muted)" }}
          >
            No subscriptions. No setup fees. You only pay when you sell.
          </p>
        </div>

        <div className="section-animate section-delay-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          <HomeCard
            tone="highlight"
            radius="card-lg"
            className="relative p-10"
            style={{ borderWidth: 2, borderColor: "var(--home-accent)" }}
          >
            <span
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-['Hanken_Grotesk'] font-bold whitespace-nowrap"
              style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
            >
              FOR ORGANIZERS
            </span>

            <h3
              className="font-['Syne'] text-2xl tracking-[0.5px] mb-2"
              style={{ color: "var(--home-text)" }}
            >
              Event Ticket Sales
            </h3>
            <p className="mb-4">
              <span
                className="font-['Syne'] font-medium text-4xl"
                style={{ color: "var(--home-accent)" }}
              >
                5%
              </span>{" "}
              <span
                className="font-['Hanken_Grotesk'] text-lg"
                style={{ color: "var(--home-muted)" }}
              >
                per paid ticket
              </span>
            </p>
            <p
              className="font-['Hanken_Grotesk'] font-bold text-base mb-4"
              style={{ color: "var(--home-success-text)" }}
            >
              Free tickets? Totally free.
            </p>
            <p
              className="font-['Hanken_Grotesk'] text-sm"
              style={{ color: "var(--home-muted)" }}
            >
              Keep 95% of every sale, no hidden charges or surprises.
            </p>
          </HomeCard>

          <HomeCard tone="card" radius="card-lg" className="p-10">
            <h3
              className="font-['Syne'] text-2xl tracking-[0.5px] mb-2"
              style={{ color: "var(--home-text)" }}
            >
              Event Ticket Sales
            </h3>
            <p className="mb-4">
              <span
                className="font-['Syne'] font-medium text-4xl"
                style={{ color: "var(--home-highlight-yellow)" }}
              >
                15%
              </span>{" "}
              <span
                className="font-['Hanken_Grotesk'] text-lg"
                style={{ color: "var(--home-muted)" }}
              >
                flat fee
              </span>
            </p>
            <div
              className="space-y-2 mb-4 font-['Hanken_Grotesk'] text-sm text-left inline-block"
              style={{ color: "var(--home-muted)" }}
            >
              <p>• 10% goes to the original organizer</p>
              <p>• 5% supports platform operations</p>
            </div>
            <p
              className="font-['Hanken_Grotesk'] text-sm"
              style={{ color: "var(--home-muted)" }}
            >
              Fair, simple, and built to reward creators.
            </p>
          </HomeCard>
        </div>

        <div className="section-animate section-delay-2 mt-16">
          <Button
            variant="homeAccent"
            size="lg"
            asChild
            className="drop-shadow-[0px_0px_7.5px_rgba(226,114,91,0.2)]"
          >
            <a href="/register?intent=organizer">
              <Ticket className="mr-2 w-4 h-4" />
              Start Selling Tickets
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

Note: the left/right card labels in Figma ("Function 1" = 5% highlighted, "Function 2" = 15% flat fee) both say "Event Ticket Sales" in the source design — this is preserved verbatim rather than "fixed" to say "Ticket Resales" on the right card, since that's what the Figma comps actually show. Flag this to the user/designer separately if it looks like a content bug in Figma itself; it's out of scope for this UI-only plan to invent new copy.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/` and scroll to pricing. Confirm two side-by-side cards, left one with coral border + floating badge + green free-ticket line, right one with yellow 15% figure.

- [ ] **Step 4: Commit**

```bash
git add components/pricing-section.tsx
git commit -m "Redesign pricing section as two-card layout matching dark Figma homepage"
```

---

## Task 10: FAQ section redesign

**Files:**
- Modify: `components/faq-section.tsx`

`FAQS` data array and all accordion state/logic (`openIndex`, `visibleFAQs`, `toggleFAQ`, `loadMore`) are unchanged.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { HomeCard } from "@/components/home/home-card";

const FAQS = [
  {
    question: "How much does it cost to use this platform?",
    answer:
      "There's no upfront cost to create an account or list events. You only pay a small service fee of 5% when tickets are sold, no hidden charges.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "Nope. All fees are displayed clearly before any transaction. You'll always see what's deducted and what you earn.",
  },
  {
    question: "How is the service fee deducted?",
    answer:
      "When someone buys a ticket, our service fee(5%) is automatically deducted from the total before it's credited to your wallet. You'll see a detailed breakdown in your dashboard.",
  },
  {
    question: "Do buyers pay extra fees?",
    answer:
      "No, buyers do not pay processing or convenience fee before checkout. We keep everything transparent.",
  },
  {
    question: "How do I get paid for ticket sales?",
    answer:
      "After your event or ticket resale is completed, your earnings are automatically sent to your linked payout account or wallet.",
  },
  {
    question: "When will I receive my payouts?",
    answer:
      "Payouts are processed within 7 business days after your event ends or a resale is confirmed.",
  },
  {
    question: "Are there fees for selling resale tickets?",
    answer:
      "Yes, resale tickets have a 15% total fee. 10% goes to the event organizer, and 5% goes to the platform.",
  },
  {
    question: "How do I check in attendees?",
    answer:
      "You can check in attendees by scanning their tickets. Just scan the ticket QR code, duplicates are automatically flagged.",
  },
] as const;

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = memo(function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: FAQItemProps) {
  return (
    <HomeCard tone="elevated" className="faq-item overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-6 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="font-['Syne'] text-lg"
          style={{ color: "var(--home-text)" }}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--home-accent)" }}
          aria-hidden="true"
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div
            className="px-6 pb-6 font-['Hanken_Grotesk'] text-sm leading-relaxed"
            style={{ color: "var(--home-muted)" }}
          >
            {faq.answer}
          </div>
        </div>
      </div>
    </HomeCard>
  );
});

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleFAQs, setVisibleFAQs] = useState(4);

  const toggleFAQ = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const loadMore = useCallback(() => {
    setVisibleFAQs((prev) => prev + 4);
  }, []);

  return (
    <section
      id="faq"
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="section-animate text-center mb-16">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-4xl lg:text-5xl mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-lg max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Everything you need to know about using our platform for events
            and ticket resale.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.slice(0, visibleFAQs).map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>

        {visibleFAQs < FAQS.length && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 rounded-full font-['Hanken_Grotesk'] text-base transition-colors border"
              style={{
                backgroundColor: "var(--home-badge-bg)",
                borderColor: "var(--home-border-strong)",
                color: "var(--home-text)",
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/`, scroll to FAQ. Confirm dark row cards, click a few to expand/collapse (same behavior as before), click "Show More" to reveal the remaining 4.

- [ ] **Step 4: Commit**

```bash
git add components/faq-section.tsx
git commit -m "Redesign FAQ section to match dark Figma homepage"
```

---

## Task 11: Footer redesign

**Files:**
- Modify: `components/layout/footer.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import { Logo } from "./logo";

const PLATFORM_LINKS = [
  { href: "/explore", label: "Find Events" },
  { href: "/explore", label: "Resale Market" }, // TODO: point at a dedicated resale route if/when one exists
  { href: "/organizer/create-event", label: "Create Event" },
  { href: "#", label: "Mobile App" }, // TODO: no mobile app route/link exists yet
] as const;

const SUPPORT_LINKS = [
  { href: "#", label: "Help Center" }, // TODO: no help center route exists yet
  { href: "/terms", label: "Privacy Policy" },
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
            <Logo textClassName="text-[var(--home-text-highlight)]" />
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
```

Note: `Link` with `href="mailto:..."` and `href="#"` both render fine via Next's `Link` (it passes through non-internal hrefs as plain anchors).

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual check**

Open `http://localhost:3000/` and scroll to the footer. Confirm dark background, coral wordmark, 2 social icon buttons, Platform/Support columns, centered copyright.

- [ ] **Step 4: Commit**

```bash
git add components/layout/footer.tsx
git commit -m "Redesign footer to match dark Figma homepage layout"
```

---

## Task 12: Wrap homepage in `.home-theme` and final integration

**Files:**
- Modify: `app/page.tsx`

Each section component already sets its own background/`home-theme` class independently (Tasks 6-11), but `app/page.tsx`'s outer wrapper still has the old `bg-background` class from the light theme. This task removes that stale class so there's no light flash/gap between sections and the browser chrome color.

- [ ] **Step 1: Update the wrapper**

In `app/page.tsx`, change:

```tsx
export default function HomePage() {
  return (
    <div className="bg-background">
```

to:

```tsx
export default function HomePage() {
  return (
    <div className="home-theme" style={{ backgroundColor: "var(--home-bg)" }}>
```

No other changes to this file — the dynamic-import/skeleton structure is unrelated to visual styling and stays as-is. (Optional: update `EventsSectionSkeleton`'s hardcoded `bg-white`/`bg-gray-*` classes to dark equivalents so the loading state doesn't flash light before the real dark section mounts — do this now since it's a one-line-per-class change in the same file:)

```tsx
function EventsSectionSkeleton() {
  return (
    <section
      className="home-theme py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div
            className="h-12 w-64 rounded-lg mx-auto mb-3 animate-pulse"
            style={{ backgroundColor: "var(--home-card)" }}
          />
          <div
            className="h-6 w-96 max-w-full rounded mx-auto animate-pulse"
            style={{ backgroundColor: "var(--home-card)" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--home-card)" }}
            >
              <div
                className="h-56 animate-pulse"
                style={{ backgroundColor: "var(--home-card-elevated)" }}
              />
              <div className="p-5 space-y-3">
                <div
                  className="h-6 rounded w-3/4 animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
                <div
                  className="h-4 rounded w-full animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
                <div
                  className="h-4 rounded w-1/2 animate-pulse"
                  style={{ backgroundColor: "var(--home-card-elevated)" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Wrap homepage in home-theme scope and dark-theme the loading skeleton"
```

---

## Task 13: Full-page verification

**Files:** none (verification only)

- [ ] **Step 1: Full visual pass**

With `npm run dev` running, open `http://localhost:3000/` and scroll top to bottom. Confirm every section (Header, Hero, Trending Events, Features, Pricing, FAQ, Footer) uses the dark palette consistently with no leftover light-theme backgrounds, and that fonts render as Syne (headings) / Hanken Grotesk (body) — check via browser devtools computed `font-family` on a heading and a paragraph if unsure.

- [ ] **Step 2: Regression pass on other routes**

Open `http://localhost:3000/explore` and `http://localhost:3000/login`. Confirm both still render the original light header and page styling — no bleed-through of `.home-theme` tokens or dark colors.

- [ ] **Step 3: Interaction pass**

On `http://localhost:3000/`:
- Click "Become an Organizer" → should navigate to `/register?intent=organizer`.
- Click a Trending Events card → should navigate to `/events/<slug>`.
- Click "View All" → should navigate to `/explore`.
- Expand/collapse a couple of FAQ items, then click "Show More" → remaining FAQs appear.
- Click "Start Selling Tickets" → should navigate to `/register?intent=organizer`.
- Resize the browser to mobile width → hamburger menu opens the dark mobile nav with the "Sign In" pill.

- [ ] **Step 4: Full type check**

Run: `npx tsc --noEmit`
Expected: no errors across the whole project.

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "Fix visual regressions found in homepage redesign verification pass"
```

(Skip this commit if step 1-4 found nothing to fix.)
