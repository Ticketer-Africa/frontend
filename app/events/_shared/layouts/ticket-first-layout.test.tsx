import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TicketFirstLayout } from "./ticket-first-layout";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("TicketFirstLayout", () => {
  it("renders ticket tiers and FAQ", () => {
    const event = buildDummyEventLayoutViewModel("TICKET_FIRST");
    render(<TicketFirstLayout event={event} mode="preview" />);

    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
    expect(screen.getByText("Regular")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("Can I get a refund?")).toBeInTheDocument();
  });

  it("does not render a Lineup section (Ticket-First has none)", () => {
    const event = buildDummyEventLayoutViewModel("TICKET_FIRST");
    render(<TicketFirstLayout event={event} mode="preview" />);

    expect(screen.queryByText("Lineup")).not.toBeInTheDocument();
  });
});
