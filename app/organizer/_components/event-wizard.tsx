"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";

import { useCreateEventV2, useUpdateEventV2 } from "@/services/events/events-v2.queries";
import { useToggleEventStatus } from "@/services/events/events.queries";
import { uploadImageToS3 } from "@/services/uploads/images";
import { EventV2 } from "@/types/events-v2.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import {
  eventFormSchema,
  updateEventFormSchema,
  EventFormData,
  DEFAULT_FORM_VALUES,
} from "./event-form-schema";
import { isStep1Valid } from "./event-form-validation";
import { ProgressBar } from "./progress-bar";
import { FormNavigation } from "./form-navigation";
import { EventFormStepLayout } from "./event-form-step-layout";
import { EventFormStep1 } from "./event-form-step1";
import { EventFormStepDateVenue } from "./event-form-step2";
import { EventFormStepTickets } from "./event-form-step-tickets";
import { EventFormStep4 } from "./event-form-step4";
import { EventFormStepLayoutDetails } from "./event-form-step-layout-details";
import { EventFormStepPreview } from "./event-form-step-preview";
import { EventSuccessScreen } from "./event-success-screen";

const STEP_LABELS = [
  "Layout",
  "Basics",
  "Date & Venue",
  "Tickets",
  "Advanced Settings",
  "Details",
  "Preview",
];
const TOTAL_STEPS = STEP_LABELS.length;

interface EventWizardProps {
  mode: "create" | "update";
  eventId?: string;
  initialEvent?: EventV2;
}

export function EventWizard({ mode, eventId, initialEvent }: EventWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEventV2();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEventV2();
  const { mutateAsync: toggleStatus } = useToggleEventStatus();
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(mode === "create" ? eventFormSchema : updateEventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as EventFormData,
  });

  useEffect(() => {
    if (mode !== "update" || !initialEvent) return;
    const eventDate = new Date(initialEvent.date);

    setValue("name", initialEvent.name);
    setValue("description", initialEvent.description);
    setValue("category", initialEvent.category);
    setValue("venueName", initialEvent.venueName ?? "");
    setValue("venueAddress", initialEvent.venueAddress ?? "");
    setValue("date", eventDate.toISOString().split("T")[0]);
    setValue("time", eventDate.toTimeString().slice(0, 5));
    setValue(
      "doorsOpenAt",
      initialEvent.doorsOpenAt
        ? new Date(initialEvent.doorsOpenAt).toTimeString().slice(0, 5)
        : "",
    );
    setValue("layout", initialEvent.layout);
    setValue("editorialPullQuote", initialEvent.editorialPullQuote ?? "");
    setValue("feeMode", initialEvent.feeMode);
    setValue("accessType", initialEvent.accessType === "PUBLIC" ? "PUBLIC" : "PRIVATE");
    setValue(
      "ticketCategories",
      initialEvent.ticketCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description ?? "",
        price: cat.price,
        maxTickets: cat.maxTickets,
        maxAdmissions: cat.maxAdmissions ?? 1,
      })),
    );
    setValue(
      "lineup",
      (initialEvent.lineup ?? []).map((a) => ({ id: a.id, name: a.name })),
    );
    setValue(
      "faq",
      (initialEvent.faq ?? []).map((f) => ({ id: f.id, question: f.question, answer: f.answer })),
    );
    setValue(
      "goodToKnow",
      (initialEvent.goodToKnow ?? []).map((g) => ({ id: g.id, text: g.text })),
    );
    setValue(
      "timelineSlots",
      (initialEvent.timelineSlots ?? []).map((s) => ({
        id: s.id,
        time: s.time,
        stage: s.stage,
        performer: s.performer,
      })),
    );
    setValue("isVirtual", initialEvent.isVirtual);
    setValue("virtualLink", initialEvent.virtualLink ?? "");
    setValue("isRecurring", initialEvent.isRecurring);
    setValue(
      "occurrences",
      (initialEvent.occurrences ?? []).map((o) => ({
        id: o.id, startsAt: o.startsAt, endsAt: o.endsAt ?? "", locationOverride: o.locationOverride ?? "",
      })),
    );
    setValue(
      "customFields",
      (initialEvent.customFields ?? []).map((f) => ({
        id: f.id, label: f.label, fieldType: f.fieldType, required: f.required, options: f.options ?? [],
      })),
    );
  }, [mode, initialEvent, setValue]);

  const bannerFile = watch("banner");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialEvent?.bannerUrl ?? null,
  );
  useEffect(() => {
    if (!(bannerFile instanceof File)) {
      setPreviewUrl(initialEvent?.bannerUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile, initialEvent?.bannerUrl]);

  const layout = watch("layout");
  const name = watch("name");
  const description = watch("description");
  const category = watch("category");
  const venueName = watch("venueName");
  const venueAddress = watch("venueAddress");
  const date = watch("date");
  const time = watch("time");
  const ticketCategories = watch("ticketCategories") || [];
  const lineup = watch("lineup") || [];
  const faq = watch("faq") || [];
  const goodToKnow = watch("goodToKnow") || [];
  const timelineSlots = watch("timelineSlots") || [];
  const editorialPullQuote = watch("editorialPullQuote") || "";

  const canProceed = useMemo(() => {
    const needsLineup = ["HERO_OVERLAY", "SPLIT_SCREEN", "TIMELINE"].includes(layout ?? "");
    const needsFaq = ["HERO_OVERLAY", "SPLIT_SCREEN", "EDITORIAL", "TICKET_FIRST"].includes(layout ?? "");
    const detailsValid =
      (!needsLineup || lineup.length > 0) &&
      (!needsFaq || faq.length > 0) &&
      (layout !== "TIMELINE" || timelineSlots.length > 0);

    return [
      !!layout, // 1 Layout
      isStep1Valid({ name, description, category, banner: bannerFile, requireBanner: mode === "create" }), // 2 Basics
      !!venueName && !!venueAddress && !!date && !!time, // 3 Date & Venue
      ticketCategories.length > 0 && ticketCategories.every((c) => c.name && c.price >= 0 && c.maxTickets >= 1), // 4 Tickets
      true, // 5 Advanced Settings — no required fields
      detailsValid, // 6 [Layout] Details
      true, // 7 Preview — Publish/Save as Draft handle their own submission
    ][currentStep - 1];
  }, [layout, name, description, category, bannerFile, mode, venueName, venueAddress, date, time, ticketCategories, lineup, faq, timelineSlots, currentStep]);

  const buildFormData = (data: EventFormData) => {
    const fullDate = new Date(`${data.date}T${data.time}`);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("venueName", data.venueName);
    formData.append("venueAddress", data.venueAddress);
    formData.append("date", fullDate.toISOString());
    if (data.doorsOpenAt) {
      formData.append("doorsOpenAt", new Date(`${data.date}T${data.doorsOpenAt}`).toISOString());
    }
    formData.append("layout", data.layout);
    if (data.editorialPullQuote) formData.append("editorialPullQuote", data.editorialPullQuote);
    formData.append("feeMode", data.feeMode);
    formData.append("accessType", data.accessType);
    formData.append("isVirtual", String(data.isVirtual));
    formData.append("isRecurring", String(data.isRecurring));
    if (data.isVirtual && data.virtualLink) formData.append("virtualLink", data.virtualLink);
    if (data.isRecurring && data.occurrences?.length) {
      formData.append("occurrences", JSON.stringify(data.occurrences.map(({ id, ...rest }) => rest)));
    }
    if (data.customFields?.length) {
      formData.append("customFields", JSON.stringify(data.customFields.map(({ id, ...rest }) => rest)));
    }
    formData.append("ticketCategories", JSON.stringify(ticketCategories.map(({ id, ...rest }) => rest)));
    formData.append("lineup", JSON.stringify(lineup.map(({ id, ...rest }) => rest)));
    formData.append("faq", JSON.stringify(faq.map(({ id, ...rest }) => rest)));
    formData.append("goodToKnow", JSON.stringify(goodToKnow.map(({ id, ...rest }) => rest)));
    formData.append("timelineSlots", JSON.stringify(timelineSlots.map(({ id, ...rest }) => rest)));
    return formData;
  };

  const submit = async (data: EventFormData, publish: boolean) => {
    const formData = buildFormData(data);
    try {
      if (data.banner instanceof File) {
        const bannerKey = await uploadImageToS3(data.banner, "images/events");
        formData.append("bannerKey", bannerKey);
      }

      const savedEvent =
        mode === "create"
          ? await createEvent(formData)
          : await updateEvent({ eventId: eventId!, formData });

      const shouldBeActive = publish;
      if (savedEvent.isActive !== shouldBeActive) {
        await toggleStatus(savedEvent.id);
      }

      setIsSubmitted(true);
    } catch (error: any) {
      toast.error(error?.message || `Event ${mode === "create" ? "creation" : "update"} failed`);
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setValue("banner", file);
  };
  const handleAddCategory = () => {
    setValue("ticketCategories", [
      ...ticketCategories,
      { id: crypto.randomUUID(), name: "", description: "", price: 0, maxTickets: 1, maxAdmissions: 1 },
    ]);
  };
  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return;
    setValue("ticketCategories", ticketCategories.filter((cat) => cat.id !== id));
  };

  if (isSubmitted) {
    return (
      <EventSuccessScreen
        eventName={watch("name")}
        title={mode === "create" ? "Event Created!" : "Event Updated!"}
      />
    );
  }

  return (
    <div className="organizer-event-form home-theme dark min-h-screen pt-16 bg-[var(--home-bg)] text-[var(--home-text)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-transparent" asChild disabled={isSubmitting}>
            <Link href="/organizer">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">{mode === "create" ? "Create Event" : "Update Event"}</h1>
            <p className="text-[var(--home-muted)]">Step {currentStep} of {TOTAL_STEPS}</p>
          </div>
          <div className="w-32" />
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} labels={STEP_LABELS} />

        <Card className="max-w-2xl mx-auto bg-[var(--home-card)] text-[var(--home-text)] rounded-3xl shadow-none border border-[var(--home-border)]">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === 6 && layout ? `${layout.replace("_", " ")} Details` : STEP_LABELS[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form id="event-wizard-form">
              {currentStep === 1 && (
                <EventFormStepLayout value={layout} onChange={(v) => setValue("layout", v)} />
              )}
              {currentStep === 2 && (
                <EventFormStep1
                  register={register} errors={errors} watch={watch} setValue={setValue}
                  previewUrl={previewUrl} isDisabled={isSubmitting} onFileChange={handleFileChange}
                />
              )}
              {currentStep === 3 && (
                <EventFormStepDateVenue register={register} errors={errors} watch={watch} setValue={setValue} isDisabled={isSubmitting} />
              )}
              {currentStep === 4 && (
                <EventFormStepTickets
                  register={register} errors={errors} watch={watch} setValue={setValue}
                  ticketCategories={ticketCategories} isDisabled={isSubmitting}
                  onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
                  existingTicketCategories={initialEvent?.ticketCategories?.map((cat) => ({ soldTickets: cat.minted }))}
                />
              )}
              {currentStep === 5 && (
                <EventFormStep4 watch={watch} setValue={setValue} register={register} errors={errors} isDisabled={isSubmitting} />
              )}
              {currentStep === 6 && layout && (
                <EventFormStepLayoutDetails
                  layout={layout}
                  values={{ lineup, faq, goodToKnow, timelineSlots, editorialPullQuote }}
                  onChange={(patch) => {
                    Object.entries(patch).forEach(([key, value]) => setValue(key as any, value as any));
                  }}
                  isDisabled={isSubmitting}
                />
              )}
              {currentStep === 7 && (
                <EventFormStepPreview
                  formState={watch()}
                  bannerPreviewUrl={previewUrl ?? undefined}
                  isSubmitting={isSubmitting}
                  onPublish={handleSubmit((data) => submit(data, true))}
                  onSaveDraft={handleSubmit((data) => submit(data, false))}
                />
              )}

              {currentStep < TOTAL_STEPS && (
                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  canProceed={canProceed}
                  isSubmitting={isSubmitting}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="event-wizard-form"
                />
              )}
              {currentStep === TOTAL_STEPS && (
                <div className="flex justify-start pt-6 border-t">
                  <Button type="button" variant="outline" className="bg-transparent" onClick={handlePrevious} disabled={isSubmitting}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
