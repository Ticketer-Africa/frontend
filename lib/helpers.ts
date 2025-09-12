type FormatPriceOptions = {
  locale?: string; // e.g. 'en-NG', 'en-US', 'fr-FR'
  currency?: string; // e.g. 'NGN', 'USD', 'EUR'
};

export const formatPrice = (
  amount: number,
  { locale = "en-NG", currency = "NGN" }: FormatPriceOptions = {}
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

