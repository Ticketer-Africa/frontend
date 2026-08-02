"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { EventFormData, TicketCategory } from "./event-form-schema";

interface Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  ticketCategories: TicketCategory[];
  isDisabled: boolean;
  onAddCategory: () => void;
  onRemoveCategory: (id: string) => void;
  existingTicketCategories?: Array<{ soldTickets?: number }>;
}

export function EventFormStepTickets({
  register,
  errors,
  watch,
  setValue,
  ticketCategories,
  isDisabled,
  onAddCategory,
  onRemoveCategory,
  existingTicketCategories,
}: Props) {
  const feeMode = watch("feeMode");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Categories <span className="text-red-500">*</span></p>

        {ticketCategories.map((category, index) => (
          <div key={category.id} className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Tier {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveCategory(category.id)}
                  disabled={isDisabled}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tier Name</Label>
              <Input
                placeholder="e.g. VIP, General Admission, Early Bird"
                className="h-11 rounded-xl"
                {...register(`ticketCategories.${index}.name`)}
                disabled={isDisabled}
              />
              {errors.ticketCategories?.[index]?.name && (
                <p className="text-xs text-red-500">{errors.ticketCategories[index]?.name?.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                placeholder="General admission, standing area access"
                className="rounded-xl"
                {...register(`ticketCategories.${index}.description`)}
                disabled={isDisabled}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Price (₦)</Label>
                <Input
                  type="number"
                  placeholder="0 for free"
                  className="h-11 rounded-xl"
                  min="0"
                  step="100"
                  {...register(`ticketCategories.${index}.price`)}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.price && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.price?.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Total Tickets</Label>
                <Input
                  type="number"
                  placeholder="Available qty"
                  className="h-11 rounded-xl"
                  min={existingTicketCategories?.[index]?.soldTickets || 1}
                  {...register(`ticketCategories.${index}.maxTickets`)}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.maxTickets && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.maxTickets?.message}</p>
                )}
                {!!existingTicketCategories?.[index]?.soldTickets &&
                  Number(category.maxTickets) < existingTicketCategories[index]!.soldTickets! && (
                    <p className="text-xs text-red-500">
                      Can&apos;t be less than the {existingTicketCategories[index]!.soldTickets} tickets already sold
                    </p>
                  )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Admissions / Ticket</Label>
                <Input
                  type="number"
                  placeholder="1"
                  className="h-11 rounded-xl"
                  min="1"
                  {...register(`ticketCategories.${index}.maxAdmissions`)}
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
        ))}

        {errors.ticketCategories && typeof errors.ticketCategories.message === "string" && (
          <p className="text-xs text-red-500">{errors.ticketCategories.message}</p>
        )}

        <button
          type="button"
          onClick={onAddCategory}
          disabled={isDisabled}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
        >
          <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
          Add Another Tier
        </button>
      </div>

      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Fees</p>
        <p className="text-xs text-gray-500">Who pays the platform service fees?</p>
        <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setValue("feeMode", "ORGANIZER")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
              feeMode === "ORGANIZER" ? "bg-[#1E88E5] text-white shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            You Pay
          </button>
          <button
            type="button"
            onClick={() => setValue("feeMode", "ATTENDEE")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
              feeMode === "ATTENDEE" ? "bg-[#1E88E5] text-white shadow" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Attendees Pay
          </button>
        </div>
      </div>
    </div>
  );
}
