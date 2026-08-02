"use client";

import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

export interface GoodToKnowFormItem {
  id: string;
  text: string;
}

interface Props {
  points: GoodToKnowFormItem[];
  onChange: (points: GoodToKnowFormItem[]) => void;
  isDisabled?: boolean;
}

export function GoodToKnowEditor({ points, onChange, isDisabled }: Props) {
  const add = () => onChange([...points, { id: crypto.randomUUID(), text: "" }]);
  const remove = (id: string) => onChange(points.filter((p) => p.id !== id));
  const update = (id: string, text: string) =>
    onChange(points.map((p) => (p.id === id ? { ...p, text } : p)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Good To Know</p>
      {points.map((point) => (
        <div key={point.id} className="flex items-center gap-2">
          <Input
            placeholder="e.g. Free on-site parking available"
            className="h-11 rounded-xl"
            value={point.text}
            onChange={(e) => update(point.id, e.target.value)}
            disabled={isDisabled}
          />
          <button type="button" aria-label="Remove point" onClick={() => remove(point.id)} disabled={isDisabled}>
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
        + Add Point
      </button>
    </div>
  );
}
