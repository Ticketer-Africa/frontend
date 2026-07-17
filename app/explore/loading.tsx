import { EventsGridSkeleton, FiltersSkeleton } from "./skeletons";

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
        {/* Header - static text, same dimensions as real header */}
        <header className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "var(--home-text)" }}
          >
            Discover Amazing Events
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: "var(--home-muted)" }}
          >
            Find and book tickets for the best events happening near you
          </p>
        </header>

        {/* Filter skeleton */}
        <FiltersSkeleton />

        {/* Events grid skeleton - 6 cards for above-the-fold content */}
        <EventsGridSkeleton />
      </div>
    </div>
  );
}
