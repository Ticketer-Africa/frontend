import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
