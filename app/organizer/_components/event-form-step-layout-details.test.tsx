import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventFormStepLayoutDetails } from "./event-form-step-layout-details";

const emptyValues = {
  lineup: [],
  faq: [],
  goodToKnow: [],
  timelineSlots: [],
  editorialPullQuote: "",
};

describe("EventFormStepLayoutDetails", () => {
  it("shows Lineup and FAQ editors for Hero Overlay", () => {
    render(<EventFormStepLayoutDetails layout="HERO_OVERLAY" values={emptyValues} onChange={() => {}} />);
    expect(screen.getByText("Lineup")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.queryByText("Good To Know")).not.toBeInTheDocument();
  });

  it("shows only FAQ for Ticket-First", () => {
    render(<EventFormStepLayoutDetails layout="TICKET_FIRST" values={emptyValues} onChange={() => {}} />);
    expect(screen.queryByText("Lineup")).not.toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("shows pull quote, Good To Know, and FAQ for Editorial", () => {
    render(<EventFormStepLayoutDetails layout="EDITORIAL" values={emptyValues} onChange={() => {}} />);
    expect(screen.getByLabelText("Pull Quote")).toBeInTheDocument();
    expect(screen.getByText("Good To Know")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("shows Lineup and Show Timeline for Timeline", () => {
    render(<EventFormStepLayoutDetails layout="TIMELINE" values={emptyValues} onChange={() => {}} />);
    expect(screen.getByText("Lineup")).toBeInTheDocument();
    expect(screen.getByText("Show Timeline")).toBeInTheDocument();
    expect(screen.queryByText("FAQ")).not.toBeInTheDocument();
  });
});
