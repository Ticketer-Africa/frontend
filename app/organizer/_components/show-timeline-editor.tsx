"use client";

import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

export interface ShowTimelineFormItem {
  id: string;
  time: string;
  stage: string;
  performer: string;
}

interface Props {
  slots: ShowTimelineFormItem[];
  onChange: (slots: ShowTimelineFormItem[]) => void;
  isDisabled?: boolean;
}

export function ShowTimelineEditor({ slots, onChange, isDisabled }: Props) {
  const add = () =>
    onChange([...slots, { id: crypto.randomUUID(), time: "", stage: "", performer: "" }]);
  const remove = (id: string) => onChange(slots.filter((s) => s.id !== id));
  const update = (id: string, patch: Partial<ShowTimelineFormItem>) =>
    onChange(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Show Timeline</p>
      {slots.map((slot) => (
        <div key={slot.id} className="flex items-center gap-2">
          <Input placeholder="9:30 PM" className="h-11 rounded-xl w-28" value={slot.time} onChange={(e) => update(slot.id, { time: e.target.value })} disabled={isDisabled} />
          <Input placeholder="Main Stage" className="h-11 rounded-xl" value={slot.stage} onChange={(e) => update(slot.id, { stage: e.target.value })} disabled={isDisabled} />
          <Input placeholder="Performer" className="h-11 rounded-xl" value={slot.performer} onChange={(e) => update(slot.id, { performer: e.target.value })} disabled={isDisabled} />
          <button type="button" aria-label="Remove time slot" onClick={() => remove(slot.id)} disabled={isDisabled}>
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        disabled={isDisabled}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
      >
        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
        + Add Time Slot
      </button>
    </div>
  );
}
