import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroOverlayLayout } from "./hero-overlay-layout";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));

describe("HeroOverlayLayout", () => {
  it("renders the banner title, lineup, and FAQ", () => {
    const event = buildDummyEventLayoutViewModel("HERO_OVERLAY");
    render(<HeroOverlayLayout event={event} mode="preview" />);

    expect(screen.getByRole("heading", { name: "Afro Nation Live" })).toBeInTheDocument();
    expect(screen.getByText("Lineup")).toBeInTheDocument();
    expect(screen.getByText("Burna Boy")).toBeInTheDocument();
    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
  });
});
