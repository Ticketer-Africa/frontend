"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
  /** For update form: existing sold tickets per category */
  existingTicketCategories?: Array<{ soldTickets?: number }>;
}

/**
 * Step 2: Date, Location & Pricing
 */
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
    <>
      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          placeholder="Enter event location"
          {...register("location")}
          disabled={isDisabled}
        />
        {errors.location && (
          <p className="text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={isDisabled}
          />
          {errors.date && (
            <p className="text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            type="time"
            {...register("time")}
            disabled={isDisabled}
          />
          {errors.time && (
            <p className="text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Ticket Categories *</Label>
        {ticketCategories.map((category, index) => (
          <div
            key={category.id}
            className="border border-gray-200 rounded-lg p-4 space-y-4 ticket-category-animate bg-gray-50/50"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Category {index + 1}
              </span>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCategory(category.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  disabled={isDisabled}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            {/* Row 1: Name (full width) */}
            <div className="space-y-2">
              <Label htmlFor={`ticketCategories.${index}.name`}>
                Category Name
              </Label>
              <Input
                id={`ticketCategories.${index}.name`}
                placeholder="e.g., VIP, General Admission, Early Bird"
                {...register(`ticketCategories.${index}.name`)}
                disabled={isDisabled}
              />
              {errors.ticketCategories?.[index]?.name && (
                <p className="text-sm text-red-600">
                  {errors.ticketCategories[index]?.name?.message}
                </p>
              )}
            </div>

            {/* Row 2: Price, Total Tickets, Admissions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`ticketCategories.${index}.price`}>
                  Price (₦)
                </Label>
                <Input
                  id={`ticketCategories.${index}.price`}
                  type="number"
                  placeholder="0 for free"
                  {...register(`ticketCategories.${index}.price`)}
                  min="0"
                  step="100"
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.price && (
                  <p className="text-sm text-red-600">
                    {errors.ticketCategories[index]?.price?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`ticketCategories.${index}.maxTickets`}>
                  Total Tickets
                </Label>
                <Input
                  id={`ticketCategories.${index}.maxTickets`}
                  type="number"
                  placeholder="Available quantity"
                  {...register(`ticketCategories.${index}.maxTickets`)}
                  min={existingTicketCategories?.[index]?.soldTickets || 1}
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.maxTickets && (
                  <p className="text-sm text-red-600">
                    {errors.ticketCategories[index]?.maxTickets?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`ticketCategories.${index}.maxAdmissions`}>
                  Admissions / Ticket
                </Label>
                <Input
                  id={`ticketCategories.${index}.maxAdmissions`}
                  type="number"
                  placeholder="1"
                  {...register(`ticketCategories.${index}.maxAdmissions`)}
                  min="1"
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.maxAdmissions && (
                  <p className="text-sm text-red-600">
                    {errors.ticketCategories[index]?.maxAdmissions?.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Admissions per ticket: How many people can enter with 1 ticket?
            </p>
          </div>
        ))}
        {errors.ticketCategories && (
          <p className="text-sm text-red-600">
            {errors.ticketCategories.message}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="bg-transparent w-full sm:w-auto"
          onClick={onAddCategory}
          disabled={isDisabled}
        >
          + Add Another Category
        </Button>
      </div>
    </>
  );
}
