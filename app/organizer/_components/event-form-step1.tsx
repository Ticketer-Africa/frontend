"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageAdd02Icon } from "@hugeicons/core-free-icons";
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
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</p>

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium">Event Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            placeholder="e.g. Afrobeats Night 2026"
            className="h-11 rounded-xl"
            {...register("name")}
            disabled={isDisabled}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></Label>
          <Textarea
            id="description"
            placeholder="Describe your event — what to expect, who it's for, dress code, etc."
            className="min-h-[120px] rounded-xl whitespace-pre-wrap resize-none"
            {...register("description")}
            disabled={isDisabled}
          />
          <p className="text-xs text-gray-400">Line breaks and formatting are preserved</p>
          {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {EVENT_CATEGORIES.map((category) => {
            const isSelected = watch("category") === category.toUpperCase();
            return (
              <button
                key={category}
                type="button"
                onClick={() => setValue("category", category.toUpperCase())}
                disabled={isDisabled}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-[background-color,color,border-color,opacity,transform] border ${
                  isSelected
                    ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1E88E5] hover:text-[#1E88E5]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
      </div>

      {/* Banner */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Banner <span className="text-red-500">*</span></p>
        <div
          className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-[#1E88E5] transition-colors"
          onClick={() => !isDisabled && document.getElementById("banner")?.click()}
        >
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Banner preview" className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">Click to change</p>
              </div>
            </div>
          ) : (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <HugeiconsIcon icon={ImageAdd02Icon} className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Click to upload banner</p>
                <p className="text-xs">PNG, JPG, or WebP, up to 10MB</p>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          id="banner"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onFileChange}
          disabled={isDisabled}
        />
        {errors.banner && (
          <p className="text-xs text-red-500">
            {typeof errors.banner?.message === "string" ? errors.banner.message : null}
          </p>
        )}
      </div>
    </div>
  );
}
