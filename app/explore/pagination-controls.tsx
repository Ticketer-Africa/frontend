"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationMeta {
  currentPage: number;
  lastPage: number;
  total: number;
  prev: number | null;
  next: number | null;
}

interface PaginationControlsProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

/**
 * PaginationControls - Memoized pagination component
 *
 * Performance: memo() prevents re-renders when events data changes
 * but pagination meta stays the same
 */
function PaginationControlsComponent({
  meta,
  onPageChange,
}: PaginationControlsProps) {
  if (meta.lastPage <= 1) return null;

  const handlePrevious = () => {
    if (meta.prev) {
      onPageChange(meta.currentPage - 1);
    }
  };

  const handleNext = () => {
    if (meta.next) {
      onPageChange(meta.currentPage + 1);
    }
  };

  return (
    <nav
      className="flex items-center justify-center gap-4 mt-12"
      aria-label="Event pagination"
    >
      <Button
        onClick={handlePrevious}
        disabled={!meta.prev}
        variant="outline"
        className="flex items-center gap-2 rounded-full border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Previous
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Page {meta.currentPage} of {meta.lastPage}
        </span>
        <span className="text-sm text-gray-400" aria-hidden="true">
          |
        </span>
        <span className="text-sm text-gray-600">{meta.total} total events</span>
      </div>

      <Button
        onClick={handleNext}
        disabled={!meta.next}
        variant="outline"
        className="flex items-center gap-2 rounded-full border-[#1E88E5] text-[#1E88E5] hover:bg-[#1E88E5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
        aria-label="Go to next page"
      >
        Next
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}

export const PaginationControls = memo(PaginationControlsComponent);
