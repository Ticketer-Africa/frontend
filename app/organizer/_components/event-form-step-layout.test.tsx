import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventFormStepLayout } from "./event-form-step-layout";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("EventFormStepLayout", () => {
  it("shows all 5 layout cards with title and description", () => {
    render(<EventFormStepLayout value={undefined} onChange={vi.fn()} />);

    expect(screen.getByText("Hero Overlay")).toBeInTheDocument();
    expect(screen.getByText("Split Screen")).toBeInTheDocument();
    expect(screen.getByText("Editorial")).toBeInTheDocument();
    expect(screen.getByText("Ticket-First")).toBeInTheDocument();
    expect(screen.getByText("Timeline")).toBeInTheDocument();
    expect(
      screen.getByText("Full-bleed hero image, lineup grid, sticky ticket sidebar."),
    ).toBeInTheDocument();
  });

  it("calls onChange with the layout when a card is selected", () => {
    const onChange = vi.fn();
    render(<EventFormStepLayout value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("select-layout-TICKET_FIRST"));

    expect(onChange).toHaveBeenCalledWith("TICKET_FIRST");
  });

  it("opens the expand modal without changing the selection", () => {
    const onChange = vi.fn();
    render(<EventFormStepLayout value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByTestId("expand-layout-HERO_OVERLAY"));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Close preview")).toBeInTheDocument();
  });
});
