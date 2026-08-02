import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTicketSelection } from "./use-ticket-selection";
import { TicketCategoryV2 } from "@/types/events-v2.type";

const categories: TicketCategoryV2[] = [
  { id: "t1", name: "Regular", price: 15000, maxTickets: 10, maxAdmissions: 1, minted: 0, eventId: "e1", displayPrice: 15000 },
  { id: "t2", name: "VIP", price: 35000, maxTickets: 10, maxAdmissions: 1, minted: 0, eventId: "e1", displayPrice: 35000 },
];

describe("useTicketSelection", () => {
  it("toggles a category on and defaults its quantity to 1", () => {
    const { result } = renderHook(() => useTicketSelection(categories));

    act(() => result.current.toggleCategory(categories[0]));

    expect(result.current.selected.has("t1")).toBe(true);
    expect(result.current.quantities.t1).toBe(1);
    expect(result.current.totalTickets).toBe(1);
    expect(result.current.totalAmount).toBe(15000);
  });

  it("caps combined quantity across categories at 10", () => {
    const { result } = renderHook(() => useTicketSelection(categories));

    act(() => result.current.toggleCategory(categories[0]));
    act(() => result.current.updateQuantity("t1", () => 9));
    act(() => result.current.toggleCategory(categories[1]));
    act(() => result.current.updateQuantity("t2", (q) => q + 5));

    expect(result.current.quantities.t1 + result.current.quantities.t2).toBeLessThanOrEqual(10);
  });

  it("removes a category from selection on second toggle", () => {
    const { result } = renderHook(() => useTicketSelection(categories));

    act(() => result.current.toggleCategory(categories[0]));
    act(() => result.current.toggleCategory(categories[0]));

    expect(result.current.selected.has("t1")).toBe(false);
  });
});
