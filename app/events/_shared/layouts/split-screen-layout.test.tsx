import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SplitScreenLayout } from "./split-screen-layout";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("SplitScreenLayout", () => {
  it("defaults to the Overview tab and switches to Lineup on click", () => {
    const event = buildDummyEventLayoutViewModel("SPLIT_SCREEN");
    render(<SplitScreenLayout event={event} mode="preview" />);

    expect(screen.getByText(event.description)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Lineup" }));
    expect(screen.getByText("Burna Boy")).toBeInTheDocument();
  });

  it("renders trust badges next to the buy panel", () => {
    const event = buildDummyEventLayoutViewModel("SPLIT_SCREEN");
    render(<SplitScreenLayout event={event} mode="preview" />);

    expect(screen.getByText("Verified Organizer")).toBeInTheDocument();
    expect(screen.getByText("Secure Payment")).toBeInTheDocument();
  });

  it("requires selecting a ticket category before it can be bought", () => {
    const event = buildDummyEventLayoutViewModel("SPLIT_SCREEN");
    render(<SplitScreenLayout event={event} mode="preview" />);

    expect(screen.getByText("Select a ticket to continue")).toBeDisabled();

    fireEvent.click(screen.getAllByText("Select")[0]);

    expect(screen.getByText(/Buy Tickets ·/)).not.toBeDisabled();
  });
});
