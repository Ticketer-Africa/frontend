"use client";

import { useEffect, useState } from "react";

type Ember = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
};

function generateEmbers(count: number): Ember[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    left: Math.random() * 100,
    size: 1.5 + Math.random() * 4.5,
    duration: 12 + Math.random() * 14,
    delay: -Math.random() * 26,
    drift: (Math.random() - 0.5) * 80,
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

/** Ember-colored particles rising through the hero, matching the Figma "Stars" animation loop. */
export function EmberParticles({
  count = 28,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  // Generated after mount only — Math.random() would otherwise mismatch server/client HTML.
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    setEmbers(generateEmbers(count));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {embers.map((ember) => (
        <span
          key={ember.id}
          className="ember-particle"
          style={{
            left: `${ember.left}%`,
            width: ember.size,
            height: ember.size,
            opacity: ember.opacity,
            animationDuration: `${ember.duration}s`,
            animationDelay: `${ember.delay}s`,
            ["--ember-drift" as string]: `${ember.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
