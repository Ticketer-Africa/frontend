"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";

interface DateTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  disablePast?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  disablePast = false,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const datePart = value ? value.split("T")[0] : "";
  const timePart = value ? (value.split("T")[1] ?? "") : "";
  const selectedDate = datePart ? parseISO(datePart) : undefined;

  const update = (newDate: string, newTime: string) => {
    if (newDate) onChange(`${newDate}T${newTime || "00:00"}`);
    else onChange("");
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 flex-1 rounded-xl justify-start text-left text-sm font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-3.5 w-3.5" />
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="dark w-fit p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(day) => {
              update(day ? format(day, "yyyy-MM-dd") : "", timePart);
              setOpen(false);
            }}
            disabled={disablePast ? (day) => day < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={timePart}
        onChange={(e) => update(datePart, e.target.value)}
        disabled={disabled || !datePart}
        className="h-10 w-28 rounded-xl text-sm appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  );
}

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  disablePast?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  disablePast = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full rounded-xl justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="dark w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(day) => {
            onChange(day ? format(day, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          disabled={disablePast ? (day) => day < new Date(new Date().setHours(0, 0, 0, 0)) : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
