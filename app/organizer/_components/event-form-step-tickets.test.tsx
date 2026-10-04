import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { EventFormStepTickets } from "./event-form-step-tickets";
import { EventFormData } from "./event-form-schema";

function TicketsHarness({ isDisabled = false }: { isDisabled?: boolean }) {
  const { register, formState: { errors }, watch, setValue } = useForm<EventFormData>({
    defaultValues: { feeMode: "ORGANIZER" },
  });
  return (
    <EventFormStepTickets
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
      ticketCategories={[]}
      isDisabled={isDisabled}
      onAddCategory={vi.fn()}
      onRemoveCategory={vi.fn()}
    />
  );
}

describe("EventFormStepTickets fee payer", () => {
  it("updates the selected fee payer and explains who is charged", () => {
    render(<TicketsHarness />);
    const organizer = screen.getByRole("button", { name: "You Pay" });
    const attendee = screen.getByRole("button", { name: "Attendees Pay" });

    expect(organizer).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(attendee);
    expect(attendee).toHaveAttribute("aria-pressed", "true");
    expect(organizer).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/added to the attendee ticket price/i)).toBeInTheDocument();
  });

  it("cannot change the fee payer while the form is submitting", () => {
    render(<TicketsHarness isDisabled />);
    expect(screen.getByRole("button", { name: "You Pay" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Attendees Pay" })).toBeDisabled();
  });
});
