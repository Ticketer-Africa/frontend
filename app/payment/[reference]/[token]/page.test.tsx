import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PaymentStatusPage from "./page";
import { getPaymentStatus } from "@/services/payments/payment-status";

vi.mock("@/services/payments/payment-status", () => ({
  getPaymentStatus: vi.fn(),
}));

const pending = {
  status: "pending" as const,
  event: {
    name: "Lagos Night",
    slug: "lagos-night",
    date: null,
    venue: null,
    isVirtual: false,
  },
  tickets: [],
};

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <PaymentStatusPage params={{ reference: "V2_PURCHASE_ABC", token: "tok" }} />
    </QueryClientProvider>
  );
}

describe("PaymentStatusPage while the payment stays pending", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(getPaymentStatus).mockResolvedValue(pending);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(getPaymentStatus).mockReset();
  });

  it("tells the buyer their bank is slow after a minute", async () => {
    renderPage();
    await act(() => vi.advanceTimersByTimeAsync(5_000));
    expect(screen.getByText("Confirming your payment…")).toBeTruthy();
    expect(screen.queryByText(/taking longer than usual/)).toBeNull();

    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(screen.getByText(/taking longer than usual/)).toBeTruthy();
  });

  it("stops the spinner and polling after ten minutes", async () => {
    renderPage();

    await act(() => vi.advanceTimersByTimeAsync(605_000));

    expect(screen.getByText("Still waiting for your bank")).toBeTruthy();
    expect(screen.queryByText("Confirming your payment…")).toBeNull();
    const calls = vi.mocked(getPaymentStatus).mock.calls.length;
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(vi.mocked(getPaymentStatus).mock.calls.length).toBe(calls);
  });
});

describe("PaymentStatusPage once the payment is confirmed", () => {
  afterEach(() => {
    vi.mocked(getPaymentStatus).mockReset();
  });

  it("tells the buyer to check their email, including spam", async () => {
    vi.mocked(getPaymentStatus).mockResolvedValue({
      ...pending,
      status: "success",
      tickets: [
        {
          id: "ticket-1",
          code: "TCK-1",
          categoryName: "Regular",
          recipientName: null,
          qrValue: "https://www.ticketer.africa/verify-ticket?data=x",
        },
      ],
    });

    renderPage();

    expect(await screen.findByText("Payment confirmed")).toBeTruthy();
    expect(screen.getByText(/check your email/i)).toBeTruthy();
    expect(screen.getByText(/spam/i)).toBeTruthy();
  });
});
