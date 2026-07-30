import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
