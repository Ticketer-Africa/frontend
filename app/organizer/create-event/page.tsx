"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useCreateEventV2 } from "@/services/events/events-v2.queries";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  eventFormSchema,
  EventFormData,
  DEFAULT_FORM_VALUES,
} from "../_components/event-form-schema";
import { ProgressBar } from "../_components/progress-bar";
import { EventFormStep1 } from "../_components/event-form-step1";
import { EventFormStep2 } from "../_components/event-form-step2";
import { EventFormStep3 } from "../_components/event-form-step3";
import { EventFormStep4 } from "../_components/event-form-step4";
import { FormNavigation } from "../_components/form-navigation";
import { EventSuccessScreen } from "../_components/event-success-screen";
import { LoadingScreen } from "../_components/status-screens";

const TOTAL_STEPS = 4;

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { mutateAsync: createEvent, isPending } = useCreateEventV2();
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES as EventFormData,
  });

  const bannerFile = watch("banner");
  const previewUrl = bannerFile ? URL.createObjectURL(bannerFile) : null;

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const ticketCategories = watch("ticketCategories") || [];

  const canProceedStep1 =
    !!watch("name") && !!watch("description") && !!watch("category") && !!watch("banner");
  const canProceedStep2 =
    !!watch("location") &&
    !!watch("date") &&
    !!watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every((cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1);
  const canProceedStep3 = true;
  const canProceedStep4 = true;

  // Step order: 1 Details · 2 Date & Tickets · 3 Advanced Settings · 4 Review & Submit
  const canProceed = [canProceedStep1, canProceedStep2, canProceedStep4, canProceedStep3][currentStep - 1];

  const onSubmit = async (data: EventFormData) => {
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

    if (data.isVirtual && data.virtualLink) {
      formData.append("virtualLink", data.virtualLink);
    }
    if (data.isVirtual && data.virtualLinkReleaseAt) {
      formData.append("virtualLinkReleaseAt", data.virtualLinkReleaseAt);
    }
    if (data.isRecurring && data.occurrences?.length) {
      formData.append(
        "occurrences",
        JSON.stringify(data.occurrences.map(({ id, ...rest }) => rest)),
      );
    }
    if (data.customFields?.length) {
      formData.append(
        "customFields",
        JSON.stringify(data.customFields.map(({ id, ...rest }) => rest)),
      );
    }

    formData.append(
      "ticketCategories",
      JSON.stringify(ticketCategories.map(({ id, ...rest }) => rest)),
    );

    if (data.banner instanceof File) {
      formData.append("banner", data.banner);
    }

    try {
      await createEvent(formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Event creation failed:", error);
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
    if (currentStep < TOTAL_STEPS && canProceed) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 3) setIsConfirmed(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setIsConfirmed(false);
    }
  };

  const handleCreateAnother = () => {
    reset(DEFAULT_FORM_VALUES as EventFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
    setIsConfirmed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      (e.target as HTMLElement).tagName !== "TEXTAREA" &&
      (e.target as HTMLElement).tagName !== "BUTTON"
    ) {
      e.preventDefault();
    }
  };

  if (authLoading) return <LoadingScreen message="Loading..." subMessage="Verifying your session" />;
  if (isSubmitted) return <EventSuccessScreen eventName={watch("name")} title="Event Created!" onCreateAnother={handleCreateAnother} />;

  const stepTitles = ["Event Details", "Date & Tickets", "Advanced Settings", "Review & Fees"];

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
            <h1 className="text-3xl font-bold">Create Event</h1>
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
                    register={register} errors={errors} watch={watch} setValue={setValue}
                    previewUrl={previewUrl} isDisabled={isPending || isSubmitting}
                    onFileChange={handleFileChange}
                  />
                )}
                {currentStep === 2 && (
                  <EventFormStep2
                    register={register} errors={errors} watch={watch} setValue={setValue}
                    ticketCategories={ticketCategories} isDisabled={isPending || isSubmitting}
                    onAddCategory={handleAddCategory} onRemoveCategory={handleRemoveCategory}
                  />
                )}
                {currentStep === 3 && (
                  <EventFormStep4
                    watch={watch} setValue={setValue} register={register}
                    errors={errors} isDisabled={isPending || isSubmitting}
                  />
                )}
                {currentStep === 4 && (
                  <EventFormStep3
                    watch={watch} setValue={setValue} ticketCategories={ticketCategories}
                    previewUrl={previewUrl} isConfirmed={isConfirmed} onConfirmChange={setIsConfirmed}
                  />
                )}

                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={TOTAL_STEPS}
                  canProceed={canProceed}
                  isSubmitting={isPending || isSubmitting}
                  submitLabel="Create Event"
                  submittingLabel="Creating..."
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="event-form"
                  requiresConfirmation={currentStep === 4}
                  isConfirmed={isConfirmed}
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
