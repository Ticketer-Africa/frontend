"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUpdateEvent } from "@/services/events/events.queries";
import { getEventById } from "@/services/events/events";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  updateEventFormSchema,
  eventSubmissionSchema,
  UpdateEventFormData,
  DEFAULT_FORM_VALUES,
} from "../../_components/event-form-schema";
import { ProgressBar } from "../../_components/progress-bar";
import { EventFormStep1 } from "../../_components/event-form-step1";
import { EventFormStep2 } from "../../_components/event-form-step2";
import { EventFormStep3 } from "../../_components/event-form-step3";
import { FormNavigation } from "../../_components/form-navigation";
import { EventSuccessScreen } from "../../_components/event-success-screen";
import { LoadingScreen, ErrorScreen } from "../../_components/status-screens";

export default function UpdateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutateAsync: updateEvent, isPending } = useUpdateEvent();
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch event data
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

  // Populate form with event data
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
      setValue(
        "ticketCategories",
        event.ticketCategories?.length
          ? event.ticketCategories.map((cat: any, index: number) => ({
              id: (index + 1).toString(),
              name: cat.name,
              price: cat.price,
              maxTickets: cat.maxTickets,
            }))
          : [
              {
                id: "1",
                name: "Regular",
                price: event.price || 0,
                maxTickets: event.maxTickets || 1,
              },
            ]
      );
    }
  }, [event, eventLoading, setValue]);

  // Preview URL for banner image
  const bannerFile = watch("banner");
  const previewUrl = bannerFile
    ? URL.createObjectURL(bannerFile)
    : event?.bannerUrl || null;

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && bannerFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, bannerFile]);

  const ticketCategories = watch("ticketCategories") || [];

  // Step validation
  const canProceedStep1 =
    watch("name") && watch("description") && watch("category");
  const canProceedStep2 =
    watch("location") &&
    watch("date") &&
    watch("time") &&
    ticketCategories.length > 0 &&
    ticketCategories.every(
      (cat) => cat.name && cat.price >= 0 && cat.maxTickets >= 1
    );

  const onSubmit = async (data: UpdateEventFormData) => {
    // Map ticketCategories to exclude id for backend submission
    const submissionData = {
      ...data,
      ticketCategories: data.ticketCategories.map(({ id, ...rest }) => rest),
    };

    // Validate submission data
    const validatedData = eventSubmissionSchema.parse(submissionData);

    const fullDate = new Date(`${validatedData.date}T${validatedData.time}`);
    const isoDate = fullDate.toISOString();

    const formData = new FormData();
    formData.append("name", validatedData.name);
    formData.append("description", validatedData.description);
    formData.append("category", validatedData.category);
    formData.append("location", validatedData.location);
    formData.append("date", isoDate);
    formData.append(
      "ticketCategories",
      JSON.stringify(validatedData.ticketCategories)
    );
    if (validatedData.banner instanceof File) {
      formData.append("file", validatedData.banner);
    }

    try {
      await updateEvent({ eventId, data: formData });
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
    const newId = (ticketCategories.length + 1).toString();
    setValue("ticketCategories", [
      ...ticketCategories,
      { id: newId, name: "", price: 0, maxTickets: 1 },
    ]);
  };

  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return;
    setValue(
      "ticketCategories",
      ticketCategories.filter((cat) => cat.id !== id)
    );
  };

  const handleNext = () => {
    if (
      currentStep < 3 &&
      (currentStep === 1 ? canProceedStep1 : canProceedStep2)
    ) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAnother = () => {
    reset(DEFAULT_FORM_VALUES as UpdateEventFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
    router.push("/organizer/create-event");
  };

  if (authLoading || eventLoading) {
    return (
      <LoadingScreen
        message="Loading..."
        subMessage={authLoading ? "Verifying your session" : "Fetching event details"}
      />
    );
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error"
        message="Failed to load event details. Please try again later."
      />
    );
  }

  if (isSubmitted) {
    return (
      <EventSuccessScreen
        eventName={watch("name")}
        title="Event Updated!"
        message={`Your event "${watch("name")}" has been successfully updated.`}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            className="bg-transparent"
            asChild
            disabled={isPending || isSubmitting}
          >
            <Link href="/organizer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Update Event</h1>
            <p className="text-gray-600">Step {currentStep} of 3</p>
          </div>
          <div className="w-32" />
        </div>

        <ProgressBar currentStep={currentStep} />

        {/* Step Content */}
        <div className="step-content-animate">
          <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentStep === 1 && "Event Details"}
                {currentStep === 2 && "Date & Pricing"}
                {currentStep === 3 && "Review & Submit"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} id="update-event-form">
                {currentStep === 1 && (
                  <EventFormStep1
                    register={register as any}
                    errors={errors as any}
                    watch={watch as any}
                    setValue={setValue as any}
                    previewUrl={previewUrl}
                    isDisabled={isPending || isSubmitting}
                    onFileChange={handleFileChange}
                  />
                )}

                {currentStep === 2 && (
                  <EventFormStep2
                    register={register as any}
                    errors={errors as any}
                    watch={watch as any}
                    setValue={setValue as any}
                    ticketCategories={ticketCategories}
                    isDisabled={isPending || isSubmitting}
                    onAddCategory={handleAddCategory}
                    onRemoveCategory={handleRemoveCategory}
                    existingTicketCategories={event?.ticketCategories}
                  />
                )}

                {currentStep === 3 && (
                  <EventFormStep3
                    watch={watch as any}
                    ticketCategories={ticketCategories}
                    previewUrl={previewUrl}
                  />
                )}

                <FormNavigation
                  currentStep={currentStep}
                  canProceed={currentStep === 1 ? canProceedStep1 : canProceedStep2}
                  isSubmitting={isPending || isSubmitting}
                  submitLabel="Update Event"
                  submittingLabel="Updating..."
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  formId="update-event-form"
                />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
