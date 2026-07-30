import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventFormStepPreview } from "./event-form-step-preview";
import { EventFormData } from "./event-form-schema";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function buildFormState(): EventFormData {
  return {
    name: "Afro Nation Live",
    description: "The biggest night of the year.",
    category: "CONCERT",
    venueName: "Eko Atlantic",
    venueAddress: "Eko Atlantic City, Lagos",
    date: "2026-08-08",
    time: "21:00",
    doorsOpenAt: "19:00",
    layout: "TICKET_FIRST",
    feeMode: "ORGANIZER",
    accessType: "PUBLIC",
    ticketCategories: [{ id: "1", name: "Regular", price: 15000, maxTickets: 500, maxAdmissions: 1 }],
    lineup: [],
    faq: [{ id: "f1", question: "Refunds?", answer: "No." }],
    goodToKnow: [],
    timelineSlots: [],
    editorialPullQuote: "",
    isVirtual: false,
    virtualLink: "",
    virtualLinkReleaseAt: "",
    isRecurring: false,
    occurrences: [],
    customFields: [],
    banner: undefined,
  } as unknown as EventFormData;
}

describe("EventFormStepPreview", () => {
  it("renders the chosen layout live with the current form data", () => {
    render(
      <EventFormStepPreview
        formState={buildFormState()}
        bannerPreviewUrl={undefined}
        isSubmitting={false}
        onPublish={vi.fn()}
        onSaveDraft={vi.fn()}
      />,
    );

    expect(screen.getByText("Select Your Tickets")).toBeInTheDocument();
    expect(screen.getByText("Refunds?")).toBeInTheDocument();
  });

  it("calls onPublish and onSaveDraft from their respective buttons", () => {
    const onPublish = vi.fn();
    const onSaveDraft = vi.fn();
    render(
      <EventFormStepPreview
        formState={buildFormState()}
        bannerPreviewUrl={undefined}
        isSubmitting={false}
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
      />,
    );

    fireEvent.click(screen.getByText("Publish Event"));
    fireEvent.click(screen.getByText("Save as Draft"));

    expect(onPublish).toHaveBeenCalled();
    expect(onSaveDraft).toHaveBeenCalled();
  });
});
