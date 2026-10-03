export function SiteAnalytics({ windowDays, uniqueVisitors, pageViews }: { windowDays: number; uniqueVisitors: number; pageViews: number }) {
  return <section aria-label="Site analytics" className="es-analytics">
    <p className="es-analytics-period">Last {windowDays} days</p>
    <div className="es-analytics-grid">
      <div><span data-testid="unique-visitors">{uniqueVisitors}</span><strong>Unique visitors</strong></div>
      <div><span data-testid="site-views">{pageViews}</span><strong>Page views</strong></div>
    </div>
    <p className="es-analytics-note">Unique visitors are estimated from first party browser IDs. The ID lasts 90 days in browser storage. A visit is recorded when a published page opens; editor previews are excluded.</p>
  </section>;
}
