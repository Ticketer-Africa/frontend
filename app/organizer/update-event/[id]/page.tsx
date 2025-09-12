"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useUpdateEvent } from "@/services/events/events.queries";
import { getEventById } from "@/services/events/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Upload, Check, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/helpers";

// Valid event categories (title case for UI display)
const categories = [
  "Music",
  "Concert",
  "Conference",
  "Workshop",
  "Sports",
  "Comedy",
  "Theatre",
  "Festival",
  "Exhibition",
  "Religion",
  "Networking",
  "Tech",
  "Fashion",
  "Party",
];

// Uppercase categories for validation and backend
const uppercaseCategories = categories.map((cat) => cat.toUpperCase()) as [
  string,
  ...string[]
];

// Zod Schema for frontend form handling (includes id for React state)
const updateEventSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(uppercaseCategories, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  location: z.string().min(3, "Location is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => new Date(val) >= new Date(), "Date cannot be in the past"),
  time: z.string().min(1, "Time is required"),
  ticketCategories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Category name is required"),
        price: z.coerce.number().min(0, "Price must be non-negative"),
        maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
      })
    )
    .min(1, "At least one ticket category is required"),
  banner: z
    .any()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "File size must be ≤10MB"
    )
    .refine(
      (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
      "File must be PNG or JPG"
    )
    .optional(),
});

// Zod Schema for backend submission (excludes id)
const submissionSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(uppercaseCategories),
  location: z.string().min(3, "Location is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  ticketCategories: z
    .array(
      z.object({
        name: z.string().min(3, "Category name is required"),
        price: z.coerce.number().min(0, "Price must be non-negative"),
        maxTickets: z.coerce.number().min(1, "At least 1 ticket is required"),
      })
    )
    .min(1, "At least one ticket category is required"),
  banner: z
    .any()
    .refine(
      (file) => !file || file.size <= 10 * 1024 * 1024,
      "File size must be ≤10MB"
    )
    .refine(
      (file) => !file || ["image/png", "image/jpeg"].includes(file.type),
      "File must be PNG or JPG"
    )
    .optional(),
});

type UpdateEventForm = z.infer<typeof updateEventSchema>;

export default function UpdateEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { mutateAsync: updateEvent, isPending } = useUpdateEvent();
  const { isLoading: authLoading, user: currentUser } = useAuth();
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
  } = useForm<UpdateEventForm>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      location: "",
      date: "",
      time: "",
      ticketCategories: [{ id: "1", name: "Regular", price: 0, maxTickets: 1 }],
      banner: undefined,
    },
  });

  // Populate form with event data
  useEffect(() => {
    if (event && !eventLoading) {
      const eventDate = new Date(event.date);
      const date = eventDate.toISOString().split("T")[0];
      const time = eventDate.toTimeString().slice(0, 5);

      setValue("name", event.name);
      setValue("description", event.description);
      setValue("category", event.category); // Expecting uppercase (e.g., MUSIC)
      setValue("location", event.location);
      setValue("date", date);
      setValue("time", time);
      // Populate ticketCategories, assuming event.ticketCategories exists
      setValue(
        "ticketCategories",
        event.ticketCategories?.length
          ? event.ticketCategories.map((cat: any, index: any) => ({
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

  // Redirect if not authenticated or not an organizer
  useEffect(() => {
    if (!currentUser && !authLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    if (currentUser && !["ORGANIZER"].includes(currentUser.role)) {
      router.push("/explore");
      return;
    }
  }, [currentUser, authLoading, router]);

  // Clean up preview URL to prevent memory leaks
  const previewUrl = watch("banner")
    ? URL.createObjectURL(watch("banner"))
    : event?.bannerUrl || null;

  useEffect(() => {
    return () => {
      if (previewUrl && watch("banner")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, watch]);

  const ticketCategories = watch("ticketCategories") || [];
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

  const onSubmit = async (data: UpdateEventForm) => {
    // Map ticketCategories to exclude id for backend submission
    const submissionData = {
      ...data,
      ticketCategories: data.ticketCategories.map(({ id, ...rest }) => rest),
    };

    // Validate submission data
    const validatedData = submissionSchema.parse(submissionData);

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

    // Log FormData for debugging
    console.log("FormData being sent:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
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
    const newCategories = [
      ...ticketCategories,
      { id: newId, name: "", price: 0, maxTickets: 1 },
    ];
    setValue("ticketCategories", newCategories);
  };

  const handleRemoveCategory = (id: string) => {
    if (ticketCategories.length === 1) return; // Prevent removing the last category
    const newCategories = ticketCategories.filter((cat) => cat.id !== id);
    setValue("ticketCategories", newCategories);
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
    reset({
      name: "",
      description: "",
      category: "",
      location: "",
      date: "",
      time: "",
      ticketCategories: [{ id: "1", name: "Regular", price: 0, maxTickets: 1 }],
      banner: undefined,
    });
    setCurrentStep(1);
    setIsSubmitted(false);
    router.push("/organizer/create");
  };

  if (authLoading || eventLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50"
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">
            {authLoading ? "Verifying your session" : "Fetching event details"}
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-gray-600 mb-6">
            Failed to load event details. Please try again later.
          </p>
          <Button
            className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href="/organizer">Back to Dashboard</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Event Updated!</h1>
          <p className="text-gray-600 mb-6">
            Your event "{watch("name")}" has been successfully updated.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/organizer">Go to Dashboard</Link>
            </Button>
            <Button
              className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleCreateAnother}
            >
              Create New Event
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
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

        {/* Progress Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Event Details</span>
            <span>Date & Pricing</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
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
                {/* Step 1: Event Details */}
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter event name"
                        {...register("name")}
                        disabled={isPending || isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your event..."
                        className="min-h-[100px]"
                        {...register("description")}
                        disabled={isPending || isSubmitting}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category}
                            type="button"
                            variant={
                              watch("category") === category.toUpperCase()
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              setValue("category", category.toUpperCase())
                            }
                            className={
                              watch("category") === category.toUpperCase()
                                ? "bg-[#1E88E5] hover:bg-blue-500 text-white"
                                : "bg-transparent"
                            }
                            disabled={isPending || isSubmitting}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                      {errors.category && (
                        <p className="text-sm text-red-600">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Event Banner</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Banner preview"
                            className="mx-auto max-h-32 object-contain mb-2"
                          />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                        <input
                          type="file"
                          id="banner"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isPending || isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-transparent"
                          onClick={() =>
                            document.getElementById("banner")?.click()
                          }
                          disabled={isPending || isSubmitting}
                        >
                          Choose File
                        </Button>
                      </div>
                      {errors.banner && (
                        <p className="text-sm text-red-600">
                          {typeof errors.banner?.message === "string"
                            ? errors.banner.message
                            : null}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 2: Date & Pricing */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        placeholder="Enter event location"
                        {...register("location")}
                        disabled={isPending || isSubmitting}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-600">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          {...register("date")}
                          disabled={isPending || isSubmitting}
                        />
                        {errors.date && (
                          <p className="text-sm text-red-600">
                            {errors.date.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <Input
                          id="time"
                          type="time"
                          {...register("time")}
                          disabled={isPending || isSubmitting}
                        />
                        {errors.time && (
                          <p className="text-sm text-red-600">
                            {errors.time.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Ticket Categories *</Label>
                      {ticketCategories.map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border border-gray-200 rounded-lg p-4 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`ticketCategories.${index}.name`}>
                                Category Name
                              </Label>
                              <Input
                                id={`ticketCategories.${index}.name`}
                                placeholder="e.g., VIP, General Admission"
                                {...register(`ticketCategories.${index}.name`)}
                                // disabled={index === 0 || isPending || isSubmitting}
                              />
                              {errors.ticketCategories?.[index]?.name && (
                                <p className="text-sm text-red-600">
                                  {errors.ticketCategories[index].name?.message}
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`ticketCategories.${index}.price`}
                              >
                                Price (₦)
                              </Label>
                              <Input
                                id={`ticketCategories.${index}.price`}
                                type="number"
                                placeholder="0 for free"
                                {...register(`ticketCategories.${index}.price`)}
                                min="0"
                                step="100"
                                disabled={isPending || isSubmitting}
                              />
                              {errors.ticketCategories?.[index]?.price && (
                                <p className="text-sm text-red-600">
                                  {
                                    errors.ticketCategories[index].price
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor={`ticketCategories.${index}.maxTickets`}
                              >
                                Total Tickets
                              </Label>
                              <Input
                                id={`ticketCategories.${index}.maxTickets`}
                                type="number"
                                placeholder="Number of tickets"
                                {...register(
                                  `ticketCategories.${index}.maxTickets`
                                )}
                                min={
                                  event?.ticketCategories?.[index]
                                    ?.soldTickets || 1
                                }
                                disabled={isPending || isSubmitting}
                              />
                              {errors.ticketCategories?.[index]?.maxTickets && (
                                <p className="text-sm text-red-600">
                                  {
                                    errors.ticketCategories[index].maxTickets
                                      ?.message
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                          {index > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCategory(category.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isPending || isSubmitting}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </motion.div>
                      ))}
                      {errors.ticketCategories && (
                        <p className="text-sm text-red-600">
                          {errors.ticketCategories.message}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-transparent"
                        onClick={handleAddCategory}
                        disabled={isPending || isSubmitting}
                      >
                        Add Category
                      </Button>
                    </div>

                    {ticketCategories.some((cat) => cat.price > 0) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Pricing Breakdown
                        </h4>
                        <div className="space-y-2 text-sm text-blue-800">
                          {ticketCategories.map((cat, index) => (
                            <div key={cat.id} className="space-y-1">
                              <div className="flex justify-between">
                                <span>{cat.name} Price:</span>
                                <span>{formatPrice(cat.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform Fee (5%):</span>
                                <span>
                                  {formatPrice(Math.round(cat.price * 0.05))}
                                </span>
                              </div>
                              <div className="flex justify-between font-medium border-t border-blue-300 pt-1">
                                <span>You receive per {cat.name} ticket:</span>
                                <span>
                                  {formatPrice(Math.round(cat.price * 0.95))}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Event Details</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <p className="font-medium">{watch("name")}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <p className="font-medium">
                              {watch("category").charAt(0) +
                                watch("category").slice(1).toLowerCase()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Description:</span>
                            <p className="font-medium line-clamp-3">
                              {watch("description")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Date & Pricing</h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <p className="font-medium">{watch("location")}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date & Time:</span>
                            <p className="font-medium">
                              {watch("date") &&
                                new Date(
                                  watch("date")
                                ).toLocaleDateString()}{" "}
                              at {watch("time")}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Ticket Categories:
                            </span>
                            {ticketCategories.map((cat) => (
                              <p key={cat.id} className="font-medium">
                                {cat.name}: {formatPrice(cat.price)} (
                                {cat.maxTickets} tickets)
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {previewUrl && (
                      <div>
                        <h3 className="font-semibold mb-2">Banner Preview</h3>
                        <img
                          src={previewUrl}
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {ticketCategories.some((cat) => cat.price > 0) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">
                          Revenue Projection
                        </h4>
                        <div className="space-y-1 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>If all tickets sell:</span>
                            <span className="font-medium">
                              {formatPrice(
                                ticketCategories.reduce(
                                  (sum, cat) =>
                                    sum + cat.price * cat.maxTickets * 0.95,
                                  0
                                )
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    className="bg-transparent"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || isPending || isSubmitting}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleNext}
                      disabled={
                        (currentStep === 1
                          ? !canProceedStep1
                          : !canProceedStep2) ||
                        isPending ||
                        isSubmitting
                      }
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      form="update-event-form"
                      className="bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isPending || isSubmitting}
                    >
                      {isPending || isSubmitting
                        ? "Updating..."
                        : "Update Event"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
