"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-time-picker";
import { Trash2, Plus } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";

interface Step2Props {
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

export function EventFormStep2({
  register,
  errors,
  watch,
  setValue,
  ticketCategories,
  isDisabled,
  onAddCategory,
  onRemoveCategory,
  existingTicketCategories,
}: Step2Props) {
  return (
    <div className="space-y-6">
      {/* Date & Location */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">When & Where</p>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm font-medium">Location <span className="text-red-500">*</span></Label>
          <Input
            id="location"
            placeholder="e.g. Muri Okunola Park, Lagos"
            className="h-11 rounded-xl"
            {...register("location")}
            disabled={isDisabled}
          />
          {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Date <span className="text-red-500">*</span></Label>
            <DatePicker
              value={watch("date")}
              onChange={(val) => setValue("date", val)}
              disabled={isDisabled}
              disablePast
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time" className="text-sm font-medium">Time <span className="text-red-500">*</span></Label>
            <Input
              id="time"
              type="time"
              className="h-11 rounded-xl appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              {...register("time")}
              disabled={isDisabled}
            />
            {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
          </div>
        </div>
      </div>

      {/* Ticket Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Categories <span className="text-red-500">*</span></p>
        </div>

        {ticketCategories.map((category, index) => (
          <div
            key={category.id}
            className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Category {index + 1}</span>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveCategory(category.id)}
                  disabled={isDisabled}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category Name</Label>
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
                {errors.ticketCategories?.[index]?.maxAdmissions && (
                  <p className="text-xs text-red-500">{errors.ticketCategories[index]?.maxAdmissions?.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">Admissions per ticket: how many people enter with 1 ticket (use &gt;1 for group tickets)</p>
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
          <Plus className="h-4 w-4" />
          Add Another Category
        </button>
      </div>
    </div>
  );
}
