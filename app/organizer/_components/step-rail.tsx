"use client";

interface StepRailProps {
  title: string;
  currentStep: number;
  labels: string[];
  onStepClick: (step: number) => void;
}

/**
 * Vertical sticky step navigator for the event wizard (left rail).
 */
export function StepRail({ title, currentStep, labels, onStepClick }: StepRailProps) {
  return (
    <div className="flex flex-col gap-1 sticky top-24 self-start">
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
  );
}
