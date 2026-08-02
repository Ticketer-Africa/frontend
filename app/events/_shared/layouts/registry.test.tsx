import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LAYOUT_COMPONENTS, LAYOUT_META } from "./registry";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("layout registry", () => {
  it("has an entry for all 5 layouts", () => {
    const layouts = ["HERO_OVERLAY", "SPLIT_SCREEN", "EDITORIAL", "TICKET_FIRST", "TIMELINE"] as const;
    for (const layout of layouts) {
      expect(LAYOUT_COMPONENTS[layout]).toBeDefined();
      expect(LAYOUT_META[layout].title).toBeTruthy();
    }
  });

  it("renders the component matching a given layout", () => {
    const Component = LAYOUT_COMPONENTS.TICKET_FIRST;
    render(<Component event={buildDummyEventLayoutViewModel("TICKET_FIRST")} mode="preview" />);
    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
  });
});
