"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  AlertDiamondIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * App-wide toast styling, skinned entirely with .home-theme design tokens
 * (see app/globals.css). This is the single source of truth for toast
 * presentation — mount <Toaster /> from here rather than configuring
 * sonner ad hoc elsewhere.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      closeButton
      icons={{
        success: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--home-success)]/15 text-[var(--home-success)]">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
          </span>
        ),
        error: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/15 text-red-400">
            <HugeiconsIcon icon={CancelCircleIcon} className="h-4 w-4" />
          </span>
        ),
        warning: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--home-highlight-yellow)]/15 text-[var(--home-highlight-yellow)]">
            <HugeiconsIcon icon={AlertDiamondIcon} className="h-4 w-4" />
          </span>
        ),
        info: (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--home-accent)]/15 text-[var(--home-accent)]">
            <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
          </span>
        ),
      }}
      toastOptions={{
        unstyled: false,
        style: {
          background: "var(--home-card-elevated)",
          border: "1px solid var(--home-border-strong)",
          borderRadius: "var(--home-radius-card)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          padding: "14px 16px",
        },
        classNames: {
          toast:
            "group flex items-start gap-3 rounded-[var(--home-radius-card)] font-['Hanken_Grotesk']",
          title: "text-[var(--home-text)] font-semibold text-sm leading-tight",
          description: "!text-[var(--home-muted)] text-xs leading-snug mt-0.5",
          icon: "!m-0 mt-0.5",
          closeButton:
            "!bg-[var(--home-card-highlight)] !border-[var(--home-border-strong)] !text-[var(--home-muted)] hover:!text-[var(--home-text)] hover:!bg-[var(--home-border)]",
          actionButton:
            "!bg-[var(--home-accent)] !text-[var(--home-accent-fg)] !rounded-full !px-4 !py-1 !font-semibold",
          cancelButton:
            "!bg-[var(--home-card-highlight)] !text-[var(--home-muted)] !rounded-full !px-4 !py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
