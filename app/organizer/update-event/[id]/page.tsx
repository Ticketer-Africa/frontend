"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateEventV2 } from "@/services/events/events-v2.queries";
import { getEventById } from "@/services/events/events";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  updateEventFormSchema,
  UpdateEventFormData,
  DEFAULT_FORM_VALUES,
} from "../../_components/event-form-schema";
import { ProgressBar } from "../../_components/progress-bar";
import { EventFormStep1 } from "../../_components/event-form-step1";
import { EventFormStep2 } from "../../_components/event-form-step2";
import { EventFormStep3 } from "../../_components/event-form-step3";
import { EventFormStep4 } from "../../_components/event-form-step4";
import { FormNavigation } from "../../_components/form-navigation";
import { EventSuccessScreen } from "../../_components/event-success-screen";
import { LoadingScreen, ErrorScreen } from "../../_components/status-screens";

const TOTAL_STEPS = 4;

export default function UpdateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutateAsync: updateEvent, isPending } = useUpdateEventV2();
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: event,
    isLoading: eventLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId!),
    enabled: !!eventId,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateEventFormData>({
    resolver: zodResolver(updateEventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as UpdateEventFormData,
  });

  useEffect(() => {
    if (event && !eventLoading) {
      const eventDate = new Date(event.date);
      const date = eventDate.toISOString().split("T")[0];
      const time = eventDate.toTimeString().slice(0, 5);

      setValue("name", event.name);
      setValue("description", event.description);
      setValue("category", event.category);
      setValue("location", event.location);
      setValue("date", date);
      setValue("time", time);
      setValue("feeMode", event.feeMode ?? "ORGANIZER");
      setValue("accessType", event.accessType ?? "PUBLIC");
      setValue("isVirtual", event.isVirtual ?? false);
      setValue("virtualLink", event.virtualLink ?? "");
      setValue("virtualLinkReleaseAt", event.virtualLinkReleaseAt ?? "");
      setValue("isRecurring", event.isRecurring ?? false);
      setValue(
        "occurrences",
        (event.occurrences ?? []).map((o: any) => ({
          id: o.id ?? crypto.randomUUID(),
          startsAt: o.startsAt ?? "",
          endsAt: o.endsAt ?? "",
          locationOverride: o.locationOverride ?? "",
        })),
      );
      setValue(
        "customFields",
        (event.customFields ?? []).map((f: any) => ({
          id: f.id ?? crypto.randomUUID(),
          label: f.label ?? "",
          fieldType: f.fieldType ?? "TEXT",
          required: f.required ?? false,
          options: f.options ?? [],
        })),
      );
      setValue(
        "ticketCategories",
        event.ticketCategories?.length
          ? event.ticketCategories.map((cat: any, index: number) => ({
              id: (index + 1).toString(),
              name: cat.name,
              price: cat.price,
              maxTickets: cat.maxTickets,
              maxAdmissions: cat.maxAdmissions ?? 1,
            }))
          : [{ id: "1", name: "Regular", price: event.price || 0, maxTickets: event.maxTickets || 1, maxAdmissions: 1 }],
      );
    }
  }, [event, eventLoading, setValue]);

  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : event?.bannerUrl || null;

  useEffect(() => {
    return () => { if (previewUrl && bannerFile) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl, bannerFile]);

  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 = !!watch("name") && !!watch("description") && !!watch("category");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);

  const canProceed = [canProceedStep1, canProceedStep2, true, true][currentStep - 1];

  const onSubmit = async (data: UpdateEventFormData) => {
    const fullDate = new Date(`${data.date}T${data.time}`);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("location", data.location);
    formData.append("date", fullDate.toISOString());
    formData.append("feeMode", data.feeMode);
    formData.append("accessType", data.accessType);
    formData.append("isVirtual", String(data.isVirtual));
    formData.append("isRecurring", String(data.isRecurring));

    if (data.isVirtual && data.virtualLink) formData.append("virtualLink", data.virtualLink);
    if (data.isVirtual && data.virtualLinkReleaseAt) formData.append("virtualLinkReleaseAt", data.virtualLinkReleaseAt);
    if (data.isRecurring && data.occurrences?.length) {
      formData.append("occurrences", JSON.stringify(data.occurrences.map(({ id, ...rest }) => rest)));
    }
    if (data.customFields?.length) {
      formData.append("customFields", JSON.stringify(data.customFields.map(({ id, ...rest }) => rest)));
    }
    formData.append("ticketCategories", JSON.stringify(ticketCategories.map(({ id, ...rest }) => rest)));
    if (data.banner instanceof File) formData.append("banner", data.banner);

    try {
      await updateEvent({ eventId: eventId!, formData });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Event update failed:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setValue("banner", file);
  };

  const handleAddCategory = () => {
    setValue("ticketCategories", [
      ...ticketCategories,
      { id: crypto.randomUUID(), name: "", price: 0, maxTickets: 1, maxAdmissions: 1 },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return;
    setValue("ticketCategories", ticketCategories.filter((cat) => cat.id !== id));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canProceed) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA" && (e.target as HTMLElement).tagName !== "BUTTON") {
      e.preventDefault();
    }
  };

  if (authLoading || eventLoading) return <LoadingScreen message="Loading..." subMessage="Fetching event details" />;
  if (error) return <ErrorScreen message="Failed to load event" />;
  if (isSubmitted) return <EventSuccessScreen eventName={watch("name")} title="Event Updated!" />;

  const stepTitles = ["Event Details", "Date & Tickets", "Review & Fees", "Advanced Settings"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" className="bg-transparent" asChild disabled={isPending || isSubmitting}>
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Update Event</h1>
            <p className="text-gray-600">Step {currentStep} of {TOTAL_STEPS}</p>
          </div>
          <div className="w-32" />
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        <div className="step-content-animate">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl">{stepTitles[currentStep - 1]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} id="event-form">
                {currentStep === 1 && (
                  <EventFormStep1
                    register={register as any} errors={errors as any} watch={watch as any} setValue={setValue as any}
                    previewUrl={previewUrl} isDisabled={isPending || isSubmitting}
                    onFileChange={handleFileChange}
                  />
                )}
                {currentStep === 2 && (
                  <EventFormStep2
                    register={register as any} errors={errors as any} watch={watch as any} setValue={setValue as any}
                    ticketCategories={ticketCategories} isDisabled={isPending || isSubmitting}
                    onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
                    existingTicketCategories={event?.ticketCategories?.map((cat: any) => ({ soldTickets: cat.minted }))}
                  />
                )}
                {currentStep === 3 && (
                  <EventFormStep3
                    watch={watch as any} setValue={setValue as any}
                    ticketCategories={ticketCategories} previewUrl={previewUrl}
                  />
                )}
                {currentStep === 4 && (
                  <EventFormStep4
                    watch={watch as any} setValue={setValue as any}
                    register={register as any} errors={errors as any}
                    isDisabled={isPending || isSubmitting}
                  />
                )}

                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  canProceed={canProceed}
                  isSubmitting={isPending || isSubmitting}
                  submitLabel="Save Changes"
                  submittingLabel="Saving..."
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="event-form"
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
