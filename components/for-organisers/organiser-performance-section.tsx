"use client";

const SIGNALS = [
  {
    index: "01",
    label: "Tickets sold",
    description: "Every order counted the moment it comes in, per event.",
  },
  {
    index: "02",
    label: "Revenue",
    description: "Net earnings across every ticket category you're selling.",
  },
  {
    index: "03",
    label: "Event status",
    description: "See at a glance which events are live, upcoming or closed.",
  },
  {
    index: "04",
    label: "Check-in progress",
    description: "How much of the room has arrived, tracked in real time.",
  },
] as const;

export function OrganiserPerformanceSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">
        <div>
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[40px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            See exactly how your event is doing
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base leading-relaxed max-w-md"
            style={{ color: "var(--home-muted)" }}
          >
            Your organiser dashboard stays open in one tab, so you&apos;re never
            jumping between tools to know where things stand.
          </p>
        </div>

        <div>
          {SIGNALS.map((signal, i) => (
            <div
              key={signal.label}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 py-7 ${
                i > 0 ? "border-t" : ""
              }`}
              style={{ borderColor: "var(--home-border)" }}
            >
              <span
                className="font-['Syne'] text-sm font-bold tracking-[2px] sm:w-12 flex-shrink-0"
                style={{ color: "var(--home-muted-dim)" }}
                aria-hidden="true"
              >
                {signal.index}
              </span>
              <h3
                className="font-['Syne'] font-semibold text-xl sm:w-64 flex-shrink-0"
                style={{ color: "var(--home-text)" }}
              >
                {signal.label}
              </h3>
              <p
                className="font-['Hanken_Grotesk'] text-base leading-relaxed"
                style={{ color: "var(--home-muted)" }}
              >
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
