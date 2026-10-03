import { afterEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { VisitTracker, getOrCreateVisitorId } from "./visit-tracker";

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

describe("Event Site visitors", () => {
  it("keeps one first party browser ID for 90 days then rotates it", () => {
    const first = "11111111-1111-4111-8111-111111111111";
    const second = "22222222-2222-4222-8222-222222222222";
    expect(getOrCreateVisitorId(localStorage, 1000, () => first)).toBe(first);
    expect(getOrCreateVisitorId(localStorage, 1000 + 89 * 86_400_000, () => second)).toBe(first);
    expect(getOrCreateVisitorId(localStorage, 1000 + 90 * 86_400_000, () => second)).toBe(second);
  });

  it("replaces a corrupted stored ID so the server can count the visit", () => {
    const valid = "33333333-3333-4333-8333-333333333333";
    localStorage.setItem("ticketer:event-site-visitor:v1", JSON.stringify({ id: "bad", expiresAt: 999999 }));
    expect(getOrCreateVisitorId(localStorage, 1000, () => valid)).toBe(valid);
  });

  it("posts one visit for a mounted public page using the stable browser ID", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetcher);
    const { rerender } = render(<VisitTracker slug="friday-sessions" apiBase="https://api.example.com" />);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const visitorId = JSON.parse(fetcher.mock.calls[0][1].body).visitorId;
    expect(visitorId).toMatch(/^[0-9a-f-]{36}$/);
    expect(fetcher.mock.calls[0][0]).toBe("https://api.example.com/v1/public/event-sites/friday-sessions/visit");
    rerender(<VisitTracker slug="new-slug" apiBase="https://api.example.com" />);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetcher.mock.calls[1][1].body).visitorId).toBe(visitorId);
  });
});
