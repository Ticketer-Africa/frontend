"use client";

import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

export interface LineupArtistFormItem {
  id: string;
  name: string;
}

interface Props {
  artists: LineupArtistFormItem[];
  onChange: (artists: LineupArtistFormItem[]) => void;
  isDisabled?: boolean;
}

export function LineupEditor({ artists, onChange, isDisabled }: Props) {
  const add = () => onChange([...artists, { id: crypto.randomUUID(), name: "" }]);
  const remove = (id: string) => onChange(artists.filter((a) => a.id !== id));
  const update = (id: string, name: string) =>
    onChange(artists.map((a) => (a.id === id ? { ...a, name } : a)));

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lineup</p>
      {artists.map((artist) => (
        <div key={artist.id} className="flex items-center gap-2">
          <Input
            placeholder="Artist name"
            className="h-11 rounded-xl"
            value={artist.name}
            onChange={(e) => update(artist.id, e.target.value)}
            disabled={isDisabled}
          />
          <button
            type="button"
            aria-label="Remove artist"
            onClick={() => remove(artist.id)}
            disabled={isDisabled}
          >
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
        + Add Artist
      </button>
    </div>
  );
}
