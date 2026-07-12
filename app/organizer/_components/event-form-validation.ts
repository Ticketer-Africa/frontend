interface Step1Fields {
  name?: string;
  description?: string;
  category?: string;
  banner?: unknown;
  requireBanner: boolean;
}

export function isStep1Valid({
  name,
  description,
  category,
  banner,
  requireBanner,
}: Step1Fields): boolean {
  return !!name && !!description && !!category && (!requireBanner || !!banner);
}

interface Step2TicketCategory {
  name: string;
  price: number;
  maxTickets: number;
}

interface Step2Fields {
  location?: string;
  date?: string;
  time?: string;
  ticketCategories: Step2TicketCategory[];
}

export function isStep2Valid({
  location,
  date,
  time,
  ticketCategories,
}: Step2Fields): boolean {
  return (
    !!location &&
    !!date &&
    !!time &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1)
  );
}
