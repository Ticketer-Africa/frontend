import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutExpandModal } from "./layout-expand-modal";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("LayoutExpandModal", () => {
  it("renders the live layout component with the dummy dataset when open", () => {
    const onClose = vi.fn();
    render(<LayoutExpandModal layout="TICKET_FIRST" isOpen onClose={onClose} />);

    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
    expect(screen.getByText("Afro Nation Live", { exact: false })).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<LayoutExpandModal layout="TICKET_FIRST" isOpen onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Close preview"));

    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when closed", () => {
    render(<LayoutExpandModal layout="TICKET_FIRST" isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Select Your Tickets")).not.toBeInTheDocument();
  });
});
