import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditorialLayout } from "./editorial-layout";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("EditorialLayout", () => {
  it("renders the presented-by byline, pull quote, and related events", () => {
    const event = buildDummyEventLayoutViewModel("EDITORIAL");
    render(<EditorialLayout event={event} mode="preview" />);

    expect(screen.getByText(`Presented by ${event.organizerName}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(event.pullQuote!, { exact: false })).toBeInTheDocument();
    expect(screen.getByText("You Might Also Like")).toBeInTheDocument();
    expect(screen.getByText(event.relatedEvents[0].name)).toBeInTheDocument();
  });

  it("links each related event to its own event page", () => {
    const event = buildDummyEventLayoutViewModel("EDITORIAL");
    render(<EditorialLayout event={event} mode="preview" />);

    const link = screen.getByText(event.relatedEvents[0].name).closest("a");
    expect(link).toHaveAttribute("href", `/events/${event.relatedEvents[0].slug}`);
  });

  it("opens a ticket selection modal instead of checking out directly", () => {
    const event = buildDummyEventLayoutViewModel("EDITORIAL");
    render(<EditorialLayout event={event} mode="preview" />);

    expect(screen.queryByText("Select Your Tickets")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Buy Tickets"));

    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
    expect(screen.getByText(event.ticketCategories[0].name)).toBeInTheDocument();
    expect(screen.getByText("Select a ticket to continue")).toBeDisabled();
  });
});
