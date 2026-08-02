import React from "react";
import { cn } from "@/lib/utils";

type HomeCardTone = "card" | "elevated" | "highlight";

type HomeCardProps = {
  tone?: HomeCardTone;
  radius?: "card" | "card-lg";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const toneVar: Record<HomeCardTone, string> = {
  card: "var(--home-card)",
  elevated: "var(--home-card-elevated)",
  highlight: "var(--home-card-highlight)",
};

const radiusVar: Record<NonNullable<HomeCardProps["radius"]>, string> = {
  card: "var(--home-radius-card)",
  "card-lg": "var(--home-radius-card-lg)",
};

export function HomeCard({
  tone = "card",
  radius = "card",
  className,
  children,
  style,
  ...props
}: HomeCardProps) {
  return (
    <div
      className={cn("border", className)}
      style={{
        backgroundColor: toneVar[tone],
        borderColor: "var(--home-border)",
        borderRadius: radiusVar[radius],
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
