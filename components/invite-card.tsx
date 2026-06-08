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
        <div className="bg-white rounded-xl px-6 py-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-indigo-500 mb-3">
            YOU&apos;RE INVITED
          </p>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            {eventName || "Event"}
          </h2>
          {eventDate && (
            <p className="text-sm text-slate-600 mt-2">
              {formatEventDate(eventDate)}
            </p>
          )}
          {eventLocation && (
            <p className="text-xs text-slate-500 mt-1">{eventLocation}</p>
          )}

          <div className="my-5 border border-slate-200 rounded-lg p-3 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Invite QR" className="w-full h-auto" />
          </div>

          <p className="text-sm font-semibold text-slate-900">
            {inviteeName ? `Guest: ${inviteeName}` : "Personal invite"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Scan the QR code to claim your ticket
          </p>

          <p className="text-[11px] font-bold tracking-[0.2em] text-indigo-500 mt-5">
            TICKETER.AFRICA
          </p>
        </div>
      </div>
    );
  },
);
