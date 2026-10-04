const formatNaira = (value: string) => {
  const kobo = BigInt(value);
  return `₦${(kobo / 100n).toLocaleString("en-NG")}.${(kobo % 100n).toString().padStart(2, "0")}`;
};

export function SiteAnalytics({ windowDays, uniqueVisitors, pageViews, ticketCtaClicks = 0, checkouts = 0, orders = 0, revenueKobo = "0" }: { windowDays: number; uniqueVisitors: number; pageViews: number; ticketCtaClicks?: number; checkouts?: number; orders?: number; revenueKobo?: string }) {
  return <section aria-label="Site analytics" className="es-analytics">
    <p className="es-analytics-period">Last {windowDays} days</p>
    <div className="es-analytics-grid">
      <div><span data-testid="unique-visitors">{uniqueVisitors}</span><strong>Unique visitors</strong></div>
      <div><span data-testid="site-views">{pageViews}</span><strong>Page views</strong></div>
      <div><span data-testid="ticket-cta-clicks">{ticketCtaClicks}</span><strong>Ticket button clicks</strong></div>
      <div><span data-testid="site-checkouts">{checkouts}</span><strong>Checkout attempts</strong></div>
      <div><span data-testid="site-orders">{orders}</span><strong>Completed orders</strong></div>
      <div><span data-testid="site-revenue">{formatNaira(revenueKobo)}</span><strong>Attributed revenue</strong></div>
    </div>
    <p className="es-analytics-note">Unique visitors are estimated from first party browser IDs kept for 90 days. Previews are excluded. Orders and revenue include completed purchases that carried a valid site ticket click within seven days.</p>
  </section>;
}
