import { EventsGridSkeleton, FiltersSkeleton } from "./skeletons";

// Kept in sync with app/explore/page.tsx's QUICK_CATEGORIES — this row is
// static/non-interactive here, so it's cheaper and more exact to render the
// real pill labels than to approximate their widths with skeleton bars.
const QUICK_CATEGORIES = ["Music", "Concert", "Festival", "Party", "Networking"];

/**
 * Loading component for explore page
 *
 * Performance: This renders immediately during page navigation,
 * before any JavaScript executes. The skeleton layout matches
 * the exact dimensions of the final content to prevent CLS.
 *
 * This is a Server Component - it renders on the server and
 * streams to the client immediately.
 */
export default function Loading() {
  return (
    <div
      className="home-theme min-h-screen pt-16"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - must match page.tsx's <header> exactly (classes + copy),
            otherwise the subtitle wraps differently and shifts everything
            below it once the real page mounts. */}
        <header className="text-center mb-12">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 leading-[1.05]"
            style={{ color: "var(--home-text)" }}
          >
            Discover Amazing
            <br />
            Events
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Find and book tickets for the best events happening near you across the continent.
          </p>
        </header>

        {/* Filter skeleton */}
        <FiltersSkeleton />

        {/* Quick category pills - static, matches page.tsx's real markup
            exactly (same classes, "All" selected) rather than a skeleton
            approximation, since this row's content never changes. */}
        <div
          className="flex gap-4 items-center overflow-x-auto pb-2 mb-8"
          aria-hidden="true"
        >
          <span
            className="px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap shrink-0"
            style={{ backgroundColor: "var(--home-accent)", color: "var(--home-accent-fg)" }}
          >
            All
          </span>
          {QUICK_CATEGORIES.map((category) => (
            <span
              key={category}
              className="px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap shrink-0"
              style={{
                backgroundColor: "var(--home-card-elevated)",
                color: "var(--home-muted)",
                border: "1px solid var(--home-border)",
              }}
            >
              {category}
            </span>
          ))}
        </div>

        {/* Events grid skeleton - 6 cards for above-the-fold content */}
        <EventsGridSkeleton />
      </div>
    </div>
  );
}
