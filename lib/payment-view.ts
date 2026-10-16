import type { PaymentStatus } from "@/types/payment-status.type";

export type PaymentView =
  | "confirming"
  | "slow"
  | "gave-up"
  | "confirmed"
  | "failed"
  | "invalid";

export const SLOW_AFTER_MS = 60_000;
export const GIVE_UP_AFTER_MS = 600_000;

/** Which screen the payment confirmation page shows. */
export function derivePaymentView(input: {
  status?: PaymentStatus;
  notFound: boolean;
  elapsedMs: number;
}): PaymentView {
  if (input.notFound) return "invalid";
  if (input.status === "success") return "confirmed";
  if (input.status === "failed") return "failed";
  if (input.elapsedMs < SLOW_AFTER_MS) return "confirming";
  if (input.elapsedMs < GIVE_UP_AFTER_MS) return "slow";
  return "gave-up";
}

/** Views where the page stops polling. */
export const isFinalView = (view: PaymentView) =>
  view === "confirmed" || view === "failed" || view === "invalid" || view === "gave-up";
