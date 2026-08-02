"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-time-picker";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { EventFormData } from "./event-form-schema";

interface Step2Props {
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  isDisabled: boolean;
}

export function EventFormStepDateVenue({
  register,
  errors,
  watch,
  setValue,
  isDisabled,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">When & Where</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="venueName" className="text-sm font-medium">Venue Name <span className="text-red-500">*</span></Label>
            <Input
              id="venueName"
              placeholder="e.g. Eko Atlantic"
              className="h-11 rounded-xl"
              {...register("venueName")}
              disabled={isDisabled}
            />
            {errors.venueName && <p className="text-xs text-red-500">{errors.venueName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="venueAddress" className="text-sm font-medium">Venue Address <span className="text-red-500">*</span></Label>
            <Input
              id="venueAddress"
              placeholder="e.g. Eko Atlantic City, Victoria Island, Lagos"
              className="h-11 rounded-xl"
              {...register("venueAddress")}
              disabled={isDisabled}
            />
            {errors.venueAddress && <p className="text-xs text-red-500">{errors.venueAddress.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Label htmlFor="doorsOpenAt" className="text-sm font-medium">Doors Open</Label>
            <Input
              id="doorsOpenAt"
              type="time"
              className="h-11 rounded-xl appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              {...register("doorsOpenAt")}
              disabled={isDisabled}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="time" className="text-sm font-medium">Start Time <span className="text-red-500">*</span></Label>
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
    </div>
  );
}
