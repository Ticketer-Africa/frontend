import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimelineLayout } from "./timeline-layout";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("TimelineLayout", () => {
  it("renders the show timeline in order and the lineup", () => {
    const event = buildDummyEventLayoutViewModel("TIMELINE");
    render(<TimelineLayout event={event} mode="preview" />);

    const times = screen.getAllByTestId("timeline-slot-time").map((el) => el.textContent);
    expect(times).toEqual(event.timelineSlots.map((s) => s.time));
    expect(screen.getByText("Burna Boy — Headliner")).toBeInTheDocument();
    expect(screen.getByText("Lineup")).toBeInTheDocument();
  });

  it("suggests other events to explore", () => {
    const event = buildDummyEventLayoutViewModel("TIMELINE");
    render(<TimelineLayout event={event} mode="preview" />);

    expect(screen.getByText("More Events")).toBeInTheDocument();
    expect(screen.getByText(event.relatedEvents[0].name)).toBeInTheDocument();
  });

  it("opens a ticket selection modal instead of checking out directly", () => {
    const event = buildDummyEventLayoutViewModel("TIMELINE");
    render(<TimelineLayout event={event} mode="preview" />);

    expect(screen.queryByText("Select Your Tickets")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Buy Tickets"));

    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
    expect(screen.getByText(event.ticketCategories[0].name)).toBeInTheDocument();
    expect(screen.getByText("Select a ticket to continue")).toBeDisabled();
  });
});
