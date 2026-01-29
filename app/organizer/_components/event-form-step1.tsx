"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { EventFormData, EVENT_CATEGORIES } from "./event-form-schema";

interface Step1Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  previewUrl: string | null;
  isDisabled: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Step 1: Event Details (name, description, category, banner)
 */
export function EventFormStep1({
  register,
  errors,
  watch,
  setValue,
  previewUrl,
  isDisabled,
  onFileChange,
}: Step1Props) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          placeholder="Enter event name"
          {...register("name")}
          disabled={isDisabled}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your event... You can use line breaks, bullet points, etc."
          className="min-h-[120px] whitespace-pre-wrap"
          {...register("description")}
          disabled={isDisabled}
        />
        <p className="text-xs text-gray-500">
          Formatting (lists, line breaks) will be preserved
        </p>
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Category *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EVENT_CATEGORIES.map((category) => (
            <Button
              key={category}
              type="button"
              variant={
                watch("category") === category.toUpperCase()
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setValue("category", category.toUpperCase())}
              className={
                watch("category") === category.toUpperCase()
                  ? "bg-[#1E88E5] hover:bg-blue-500 text-white"
                  : "bg-transparent"
              }
              disabled={isDisabled}
            >
              {category}
            </Button>
          ))}
        </div>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
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
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
          <input
            type="file"
            id="banner"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={onFileChange}
            disabled={isDisabled}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 bg-transparent"
            onClick={() => document.getElementById("banner")?.click()}
            disabled={isDisabled}
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
  );
}
