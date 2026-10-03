export function SiteAnalytics({ windowDays, uniqueVisitors, pageViews, ticketCtaClicks }: { windowDays: number; uniqueVisitors: number; pageViews: number; ticketCtaClicks: number }) {
  return <section aria-label="Site analytics" className="es-analytics">
    <p className="es-analytics-period">Last {windowDays} days</p>
    <div className="es-analytics-grid">
      <div><span data-testid="unique-visitors">{uniqueVisitors}</span><strong>Unique visitors</strong></div>
      <div><span data-testid="site-views">{pageViews}</span><strong>Page views</strong></div>
      <div><span data-testid="ticket-cta-clicks">{ticketCtaClicks}</span><strong>Ticket button clicks</strong></div>
    </div>
    <p className="es-analytics-note">Unique visitors are estimated from first party browser IDs. The ID lasts 90 days in browser storage. A view is recorded when a published page opens; editor previews are excluded. Ticket button clicks count attempts to open a linked edition’s ticket page.</p>
  </section>;
}
