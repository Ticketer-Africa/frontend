"use client";

import { useState } from "react";
import { UseFormWatch, UseFormSetValue, UseFormRegister, FieldErrors } from "react-hook-form";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { EventFormData, OccurrenceFormData, CustomFieldFormData } from "./event-form-schema";

interface Step4Props {
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  register: UseFormRegister<EventFormData>;
  errors: FieldErrors<EventFormData>;
  isDisabled: boolean;
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "TEXTAREA", label: "Long Text" },
  { value: "SELECT", label: "Dropdown" },
  { value: "NUMBER", label: "Number" },
  { value: "EMAIL", label: "Email" },
] as const;

export function EventFormStep4({ watch, setValue, register, errors, isDisabled }: Step4Props) {

  const isVirtual = watch("isVirtual") ?? false;
  const isRecurring = watch("isRecurring") ?? false;
  const occurrences = watch("occurrences") ?? [];
  const customFields = watch("customFields") ?? [];

  const [optionInputs, setOptionInputs] = useState<Record<number, string>>({});

  // — Occurrences —
  const addOccurrence = () => {
    const newOccurrence: OccurrenceFormData = {
      id: crypto.randomUUID(),
      startsAt: "",
      endsAt: "",
      locationOverride: "",
    };
    setValue("occurrences", [...occurrences, newOccurrence]);
  };

  const removeOccurrence = (id: string) => {
    setValue("occurrences", occurrences.filter((o) => o.id !== id));
  };

  const updateOccurrence = (id: string, field: keyof OccurrenceFormData, value: string) => {
    setValue(
      "occurrences",
      occurrences.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    );
  };

  // — Custom Fields —
  const addCustomField = () => {
    const newField: CustomFieldFormData = {
      id: crypto.randomUUID(),
      label: "",
      fieldType: "TEXT",
      required: false,
      options: [],
    };
    setValue("customFields", [...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setValue("customFields", customFields.filter((f) => f.id !== id));
  };

  const updateCustomField = (id: string, patch: Partial<CustomFieldFormData>) => {
    setValue(
      "customFields",
      customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...customFields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newFields.length) return;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];
    setValue("customFields", newFields);
  };

  const addOption = (fieldId: string, fieldIndex: number) => {
    const val = (optionInputs[fieldIndex] || "").trim();
    if (!val) return;
    const field = customFields.find((f) => f.id === fieldId);
    if (!field) return;
    updateCustomField(fieldId, { options: [...(field.options ?? []), val] });
    setOptionInputs((prev) => ({ ...prev, [fieldIndex]: "" }));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = customFields.find((f) => f.id === fieldId);
    if (!field) return;
    updateCustomField(fieldId, {
      options: (field.options ?? []).filter((_, i) => i !== optionIndex),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">All sections below are optional. Enable only what applies to your event.</p>

      {/* Virtual Event */}
      <Section
        title="Virtual Event"
        description="Add a meeting or stream link for online attendees"
        enabled={isVirtual}
        onToggle={(on) => setValue("isVirtual", on)}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Meeting / Stream Link <span className="text-red-500">*</span></Label>
            <Input
              placeholder="https://meet.google.com/..."
              className="h-11 rounded-xl"
              {...register("virtualLink")}
              disabled={isDisabled}
            />
            {errors.virtualLink && <p className="text-xs text-red-500">{errors.virtualLink.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Release Link to Attendees At (optional)</Label>
            <DateTimePicker
              value={watch("virtualLinkReleaseAt") ?? ""}
              onChange={(val) => setValue("virtualLinkReleaseAt", val)}
              disabled={isDisabled}
              placeholder="Pick a date & time"
            />
            <p className="text-xs text-gray-400">Leave blank to release immediately after purchase</p>
          </div>
        </div>
      </Section>

      {/* Recurring Occurrences */}
      <Section
        title="Multiple Occurrences"
        description="This event happens on multiple dates (e.g. weekly shows, multi-day festival)"
        enabled={isRecurring}
        onToggle={(on) => setValue("isRecurring", on)}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          {occurrences.map((occ, i) => (
            <div key={occ.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Occurrence {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeOccurrence(occ.id)}
                  disabled={isDisabled}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Start Date & Time <span className="text-red-500">*</span></Label>
                  <DateTimePicker
                    value={occ.startsAt}
                    onChange={(val) => updateOccurrence(occ.id, "startsAt", val)}
                    disabled={isDisabled}
                    placeholder="Start date"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">End Date & Time (optional)</Label>
                  <DateTimePicker
                    value={occ.endsAt ?? ""}
                    onChange={(val) => updateOccurrence(occ.id, "endsAt", val)}
                    disabled={isDisabled}
                    placeholder="End date"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Location Override (optional)</Label>
                <Input
                  placeholder="Leave blank to use main event location"
                  className="h-10 rounded-xl text-sm"
                  value={occ.locationOverride ?? ""}
                  onChange={(e) => updateOccurrence(occ.id, "locationOverride", e.target.value)}
                  disabled={isDisabled}
                />
              </div>
            </div>
          ))}

          {(errors as any).occurrences && (
            <p className="text-xs text-red-500">
              {typeof (errors as any).occurrences?.message === "string"
                ? (errors as any).occurrences.message
                : "Add at least one occurrence"}
            </p>
          )}

          <button
            type="button"
            onClick={addOccurrence}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Occurrence
          </button>
        </div>
      </Section>

      {/* Custom Checkout Fields */}
      <Section
        title="Custom Checkout Fields"
        description="Ask attendees for extra info when they buy a ticket (e.g. phone number, dietary requirements, t-shirt size)"
        enabled={customFields.length > 0}
        onToggle={(on) => {
          if (on) addCustomField();
          else setValue("customFields", []);
        }}
        disabled={isDisabled}
      >
        <div className="space-y-3">
          {customFields.map((field, i) => (
            <div key={field.id} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Field {i + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveField(i, "up")}
                    disabled={isDisabled || i === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(i, "down")}
                    disabled={isDisabled || i === customFields.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCustomField(field.id)}
                    disabled={isDisabled}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Label <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="e.g. Phone Number"
                    className="h-10 rounded-xl text-sm"
                    value={field.label}
                    onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                    disabled={isDisabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Field Type</Label>
                  <select
                    value={field.fieldType}
                    onChange={(e) => updateCustomField(field.id, { fieldType: e.target.value as CustomFieldFormData["fieldType"], options: [] })}
                    disabled={isDisabled}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                  disabled={isDisabled}
                  className="h-4 w-4 rounded border-gray-300 text-[#1E88E5]"
                />
                <span className="text-xs text-gray-600">Required field</span>
              </label>

              {field.fieldType === "SELECT" && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Options <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-1.5 min-h-8">
                    {(field.options ?? []).map((opt, oi) => (
                      <span
                        key={oi}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => removeOption(field.id, oi)}
                          disabled={isDisabled}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add option..."
                      className="h-9 rounded-xl text-sm"
                      value={optionInputs[i] ?? ""}
                      onChange={(e) => setOptionInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOption(field.id, i); } }}
                      disabled={isDisabled}
                    />
                    <button
                      type="button"
                      onClick={() => addOption(field.id, i)}
                      disabled={isDisabled}
                      className="px-3 py-1.5 bg-[#1E88E5] text-white rounded-xl text-sm hover:bg-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  {(errors as any).customFields?.[i]?.options && (
                    <p className="text-xs text-red-500">Add at least one option</p>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addCustomField}
            disabled={isDisabled}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Field
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  enabled,
  onToggle,
  disabled,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50/70 rounded-2xl p-5 space-y-4 border border-gray-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled}
          className="mt-0.5 shrink-0"
        />
      </div>
      {enabled && <div className="motion-surface opacity-100">{children}</div>}
    </div>
  );
}
