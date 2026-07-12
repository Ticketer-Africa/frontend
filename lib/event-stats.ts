export interface TicketCategoryStats {
  minted?: number;
  maxTickets: number;
  price: number;
}

export interface EventTicketStats {
  sold: number;
  total: number;
  revenue: number;
  percentSold: number;
}

export function getEventTicketStats(
  ticketCategories: TicketCategoryStats[] | undefined,
): EventTicketStats {
  const sold =
    ticketCategories?.reduce((sum, cat) => sum + (cat.minted || 0), 0) ?? 0;
  const total =
    ticketCategories?.reduce((sum, cat) => sum + (cat.maxTickets || 0), 0) ?? 0;
  const revenue =
    ticketCategories?.reduce(
      (sum, cat) => sum + (cat.minted || 0) * (cat.price || 0),
      0,
    ) ?? 0;
  const percentSold = total > 0 ? Math.round((sold / total) * 100) : 0;
  return { sold, total, revenue, percentSold };
}
