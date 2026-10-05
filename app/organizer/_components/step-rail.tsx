"use client";

interface StepRailProps {
  title: string;
  currentStep: number;
  labels: string[];
  onStepClick: (step: number) => void;
}

/**
 * Step navigator for the event wizard.
 *
 * Desktop: vertical sticky rail (left column).
 * Phones: a compact segmented progress bar, so the form itself stays above the
 * fold instead of sitting under a full-height list of every step.
 */
export function StepRail({ title, currentStep, labels, onStepClick }: StepRailProps) {
  return (
    <>
      <div className="md:hidden">
        <span className="font-bold text-xl" style={{ color: "var(--home-text)" }}>
          {title}
        </span>
        <div
          className="mt-3 flex gap-1.5"
          role="progressbar"
          aria-label={`${title} progress`}
          aria-valuemin={1}
          aria-valuemax={labels.length}
          aria-valuenow={currentStep}
          aria-valuetext={`Step ${currentStep} of ${labels.length}: ${labels[currentStep - 1]}`}
        >
          {labels.map((label, i) => {
            const step = i + 1;
            const reached = step <= currentStep;
            const clickable = step < currentStep;
            return (
              <button
                key={label}
                type="button"
                data-compact
                disabled={!clickable}
                aria-label={clickable ? `Go back to ${label}` : label}
                onClick={() => clickable && onStepClick(step)}
                // 4px bar with a taller invisible hit area so it stays tappable
                className="relative h-1.5 flex-1 rounded-full min-h-0 before:absolute before:-inset-y-3 before:inset-x-0 before:content-['']"
                style={{
                  background: reached ? "var(--home-accent)" : "var(--home-card-highlight)",
                  opacity: step === currentStep ? 1 : reached ? 0.55 : 1,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="hidden md:flex flex-col gap-1 sticky top-24 self-start">
        <span className="mb-4 font-bold text-[22px]" style={{ color: "var(--home-text)" }}>
          {title}
        </span>
        {labels.map((label, i) => {
          const step = i + 1;
          const active = step === currentStep;
          const done = step < currentStep;
          const clickable = step <= currentStep;
          return (
            <div
              key={label}
              className="flex items-center gap-3.5 py-3 px-2 rounded-lg transition-colors"
              style={{ cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.5 }}
              onClick={() => clickable && onStepClick(step)}
            >
              <span
                className="flex items-center justify-center rounded-full shrink-0 font-bold text-xs"
                style={{
                  width: 26,
                  height: 26,
                  background: active || done ? "var(--home-accent)" : "var(--home-card-highlight)",
                  color: active || done ? "var(--home-accent-fg)" : "var(--home-muted)",
                }}
              >
                {done ? "✓" : step}
              </span>
              <span
                className="text-sm"
                style={{
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--home-text)" : "var(--home-muted)",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
