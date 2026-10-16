export type PaymentStatus = "pending" | "success" | "failed";

/** GET /v1/payment/status/:reference/:token */
export interface PaymentStatusResponse {
  status: PaymentStatus;
  event: {
    name: string;
    slug: string;
    date: string | null;
    venue: string | null;
    isVirtual: boolean;
  } | null;
  /** Empty until the payment succeeds. */
  tickets: {
    id: string;
    code: string;
    categoryName: string;
    recipientName: string | null;
    /** The verify-ticket URL the QR code encodes. */
    qrValue: string;
  }[];
}
