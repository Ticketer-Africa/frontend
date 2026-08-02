"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HomeCard } from "@/components/home/home-card";

function TicketVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      <HomeCard
        tone="highlight"
        radius="card-lg"
        className="absolute top-6 left-6 right-0 bottom-0 hidden sm:block"
        style={{ borderColor: "var(--home-border-strong)" }}
      >
        {null}
      </HomeCard>

      <HomeCard
        tone="elevated"
        radius="card-lg"
        className="relative overflow-hidden shadow-2xl"
        style={{ borderColor: "var(--home-border-strong)" }}
      >
        <div className="p-6 pb-5">
          <p
            className="font-['Syne'] text-xs font-bold tracking-[2px] mb-1"
            style={{ color: "var(--home-muted-dim)" }}
          >
            REGULAR ADMISSION
          </p>
          <p className="font-['Syne'] text-xl font-semibold" style={{ color: "var(--home-text)" }}>
            Kemi T.
          </p>
        </div>

        <div
          className="relative border-t border-dashed mx-6"
          style={{ borderColor: "var(--home-border-strong)" }}
        >
          <span
            className="absolute -left-9 -top-3 w-6 h-6 rounded-full"
            style={{ backgroundColor: "var(--home-bg)" }}
          />
          <span
            className="absolute -right-9 -top-3 w-6 h-6 rounded-full"
            style={{ backgroundColor: "var(--home-bg)" }}
          />
        </div>

        <div className="p-6 pt-5 flex items-center justify-center">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--home-card)" }}
          >
            <svg
              viewBox="0 0 9 9"
              width="128"
              height="128"
              role="img"
              aria-label="Example QR code printed on the ticket"
            >
              {/* Finder patterns (the three corner squares every QR code uses) */}
              {[
                [0, 0],
                [6, 0],
                [0, 6],
              ].map(([x, y]) => (
                <g key={`${x}-${y}`} fill="var(--home-text)">
                  <rect x={x} y={y} width={3} height={3} rx={0.4} />
                  <rect x={x + 0.75} y={y + 0.75} width={1.5} height={1.5} fill="var(--home-card)" />
                  <rect x={x + 1.1} y={y + 1.1} width={0.8} height={0.8} />
                </g>
              ))}
              {/* Decorative data modules */}
              {[
                [4, 0], [4, 1], [5, 2], [4, 3],
                [0, 4], [1, 4], [2, 4], [4, 4], [5, 4], [6, 4], [7, 4],
                [4, 5], [2, 5],
                [4, 6], [5, 7], [4, 8], [6, 7], [7, 8], [8, 5], [8, 2],
              ].map(([x, y]) => (
                <rect key={`${x}-${y}`} x={x} y={y} width={0.9} height={0.9} rx={0.15} fill="var(--home-text)" />
              ))}
            </svg>
          </div>
        </div>
      </HomeCard>

      <HomeCard
        tone="highlight"
        className="hidden sm:flex absolute -bottom-6 -right-6 items-center gap-3 pl-4 pr-5 py-3 shadow-xl"
        style={{ borderColor: "var(--home-border-strong)" }}
      >
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="w-4 h-4 flex-shrink-0"
          style={{ color: "var(--home-success)" }}
          aria-hidden="true"
        />
        <p className="font-['Syne'] text-sm font-semibold" style={{ color: "var(--home-text)" }}>
          Checked in
        </p>
      </HomeCard>
    </div>
  );
}

export function OrganiserCheckinSection() {
  return (
    <section
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <TicketVisual />

        <div>
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-[40px] tracking-[-1.2px] mb-4"
            style={{ color: "var(--home-text-highlight)" }}
          >
            Every ticket, ready at the door
          </h2>
          <p
            className="font-['Hanken_Grotesk'] text-base leading-relaxed mb-6 max-w-lg"
            style={{ color: "var(--home-muted)" }}
          >
            Ticketer Africa supports you past the sale, at the venue too.
            Every ticket carries its own QR code, so your team can scan and
            validate a full room without a printed guest list.
          </p>
          <p
            className="font-['Hanken_Grotesk'] text-base leading-relaxed max-w-lg"
            style={{ color: "var(--home-muted)" }}
          >
            Duplicate scans are caught automatically, so one ticket can&apos;t get
            two people through the door.
          </p>
        </div>
      </div>
    </section>
  );
}
