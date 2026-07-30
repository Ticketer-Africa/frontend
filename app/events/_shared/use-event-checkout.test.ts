import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEventCheckout } from "./use-event-checkout";
import { EventLayoutViewModel } from "@/types/event-layout.type";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const event = { id: "evt-1", name: "Afro Nation Live" } as EventLayoutViewModel;
const selection = {
  selected: new Set(["t1"]),
  quantities: { t1: 2 },
  totalTickets: 2,
  totalAmount: 30000,
  hasSelection: true,
};
const ticketCategories = [
  { id: "t1", name: "Regular", price: 15000, displayPrice: 15000 } as any,
];

beforeEach(() => {
  push.mockClear();
  sessionStorage.clear();
});

describe("useEventCheckout", () => {
  it("stores checkout payload and navigates in live mode", () => {
    const { result } = renderHook(() =>
      useEventCheckout(event, "live", selection, ticketCategories),
    );

    result.current.handleCheckout();

    expect(push).toHaveBeenCalledWith("/checkout");
    const stored = JSON.parse(sessionStorage.getItem("checkoutData")!);
    expect(stored.eventId).toBe("evt-1");
    expect(stored.tickets).toEqual([
      { ticketCategoryId: "t1", quantity: 2, ticketCategoryName: "Regular", price: 15000 },
    ]);
  });

  it("does not navigate in preview mode", () => {
    const { result } = renderHook(() =>
      useEventCheckout(event, "preview", selection, ticketCategories),
    );

    result.current.handleCheckout();

    expect(push).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("checkoutData")).toBeNull();
  });
});
