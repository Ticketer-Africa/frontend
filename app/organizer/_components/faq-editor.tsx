"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

export interface FaqFormItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  items: FaqFormItem[];
  onChange: (items: FaqFormItem[]) => void;
  isDisabled?: boolean;
}

export function FaqEditor({ items, onChange, isDisabled }: Props) {
  const add = () =>
    onChange([...items, { id: crypto.randomUUID(), question: "", answer: "" }]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, patch: Partial<FaqFormItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">FAQ</p>
      {items.map((item) => (
        <div key={item.id} className="bg-gray-50/70 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Question"
              className="h-11 rounded-xl"
              value={item.question}
              onChange={(e) => update(item.id, { question: e.target.value })}
              disabled={isDisabled}
            />
            <button type="button" aria-label="Remove question" onClick={() => remove(item.id)} disabled={isDisabled}>
              <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 text-red-500" />
            </button>
          </div>
          <Textarea
            placeholder="Answer"
            className="rounded-xl"
            value={item.answer}
            onChange={(e) => update(item.id, { answer: e.target.value })}
            disabled={isDisabled}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        disabled={isDisabled}
        className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors flex items-center justify-center gap-2"
      >
        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
        + Add Question
      </button>
    </div>
  );
}
