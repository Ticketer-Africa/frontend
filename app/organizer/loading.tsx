export default function Loading() {
  return (
    <div className="home-theme min-h-screen bg-[var(--home-bg)] px-4 pt-24 pb-8" aria-busy="true" aria-label="Loading organizer dashboard">
      <div className="container mx-auto space-y-8 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-44 rounded-lg bg-[var(--home-card-highlight)]" />
            <div className="h-4 w-64 max-w-full rounded bg-[var(--home-card)]" />
          </div>
          <div className="h-10 w-40 rounded-full bg-[var(--home-card-highlight)]" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-6">
              <div className="h-4 w-20 rounded bg-[var(--home-card-highlight)]" />
              <div className="mt-5 h-8 w-16 rounded bg-[var(--home-card-highlight)]" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 space-y-4">
          <div className="h-7 w-32 rounded bg-[var(--home-card-highlight)]" />
          {[0, 1, 2].map((item) => <div key={item} className="h-20 rounded-xl bg-[var(--home-card-elevated)]" />)}
        </div>
      </div>
    </div>
  );
}
