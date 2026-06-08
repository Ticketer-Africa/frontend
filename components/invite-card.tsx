import { forwardRef } from "react";

export interface InviteCardProps {
  eventName?: string | null;
  eventDate?: string | Date | null;
  eventLocation?: string | null;
  inviteeName?: string | null;
  qrUrl: string;
}

const formatEventDate = (raw?: string | Date | null) => {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const InviteCard = forwardRef<HTMLDivElement, InviteCardProps>(
  function InviteCard(
    { eventName, eventDate, eventLocation, inviteeName, qrUrl },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="bg-gradient-to-b from-[#0F172A] to-[#312E81] p-4 rounded-2xl w-full max-w-sm"
      >
        <div className="bg-white rounded-xl px-6 py-6 text-center flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-indigo-500">
              YOU&apos;RE INVITED
            </p>
            <h2 className="text-lg font-extrabold text-slate-900 leading-snug break-words">
              {eventName || "Event"}
            </h2>
            {eventDate && (
              <p className="text-sm text-slate-600 leading-snug">
                {formatEventDate(eventDate)}
              </p>
            )}
            {eventLocation && (
              <p className="text-xs text-slate-500 leading-snug break-words">
                {eventLocation}
              </p>
            )}
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Invite QR" className="w-full h-auto block" />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-slate-900 break-words">
              {inviteeName ? `Guest: ${inviteeName}` : "Personal invite"}
            </p>
            <p className="text-xs text-slate-500">
              Scan the QR code to claim your ticket
            </p>
          </div>

          <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-500">
            TICKETER.AFRICA
          </p>
        </div>
      </div>
    );
  },
);
