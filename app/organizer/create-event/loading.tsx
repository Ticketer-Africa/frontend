export default function Loading() {
  return (
    <div className="home-theme min-h-screen bg-[var(--home-bg)] px-4 pt-24 pb-8" aria-busy="true" aria-label="Loading event form">
      <div className="container mx-auto max-w-2xl animate-pulse">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-10 w-40 rounded-full bg-[var(--home-card-highlight)]" />
          <div className="space-y-2 text-center">
            <div className="h-8 w-40 rounded-lg bg-[var(--home-card-highlight)]" />
            <div className="h-4 w-24 rounded bg-[var(--home-card)]" />
          </div>
          <div className="w-32" />
        </div>
        <div className="mb-8 flex items-center justify-between">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-8 w-8 rounded-full bg-[var(--home-card-highlight)]" />)}
        </div>
        <div className="rounded-3xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 space-y-6">
          <div className="h-7 w-48 rounded bg-[var(--home-card-highlight)]" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 w-28 rounded bg-[var(--home-card-highlight)]" />
              <div className="h-11 w-full rounded-xl bg-[var(--home-card-elevated)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
