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
            className="border border-gray-200 rounded-lg p-4 space-y-4 ticket-category-animate"
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
                  disabled={isDisabled}
                />
                {errors.ticketCategories?.[index]?.name && (
                  <p className="text-sm text-red-600">
                    {errors.ticketCategories[index]?.name?.message}
                  </p>
                )}
              </div>
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
                  placeholder="Number of tickets"
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
            </div>
            {index > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onRemoveCategory(category.id)}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDisabled}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
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
          className="bg-transparent"
          onClick={onAddCategory}
          disabled={isDisabled}
        >
          Add Category
        </Button>
      </div>
    </>
  );
}
