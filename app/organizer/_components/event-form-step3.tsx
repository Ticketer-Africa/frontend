"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";
import { formatPrice } from "@/lib/helpers";

interface Step3Props {
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  ticketCategories: TicketCategory[];
  previewUrl: string | null;
  isConfirmed?: boolean;
  onConfirmChange?: (confirmed: boolean) => void;
}

export function EventFormStep3({
  watch,
  setValue,
  ticketCategories,
  previewUrl,
  isConfirmed = false,
  onConfirmChange,
}: Step3Props) {
  const category = watch("category");
  const feeMode = watch("feeMode");
  const formattedCategory = category ? category.charAt(0) + category.slice(1).toLowerCase() : "";

  const totalGrossRevenue = ticketCategories.reduce(
    (sum, cat) => sum + (cat.price || 0) * (cat.maxTickets || 0),
    0,
  );
  const estimatedServiceFee = Math.round(totalGrossRevenue * 0.05);
  const netRevenue = totalGrossRevenue - estimatedServiceFee;

  return (
    <div className="space-y-5">
      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Event Details</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Name</p>
              <p className="font-medium">{watch("name")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Category</p>
              <p className="font-medium">{formattedCategory}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap">{watch("description")}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Location</p>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Location</p>
              <p className="font-medium">{watch("location")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
              <p className="font-medium">
                {watch("date") && new Date(watch("date")).toLocaleDateString()} at {watch("time")}
              </p>
            </div>
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="Banner" className="w-full h-24 object-cover rounded-xl mt-2" />
          )}
        </div>
      </div>

      {/* Ticket summary */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket Categories</p>
        <div className="space-y-2">
          {ticketCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-gray-400">
                  {cat.maxTickets} ticket{cat.maxTickets !== 1 ? "s" : ""}
                  {cat.maxAdmissions && cat.maxAdmissions > 1 ? ` · ${cat.maxAdmissions} people/ticket` : ""}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(cat.price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Mode */}
      <div className="bg-gray-50/70 rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Fees</p>
        <p className="text-xs text-gray-500">Who pays the platform service fees?</p>
        <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setValue("feeMode", "ORGANIZER")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              feeMode === "ORGANIZER"
                ? "bg-[#1E88E5] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            You Pay
          </button>
          <button
            type="button"
            onClick={() => setValue("feeMode", "ATTENDEE")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
              feeMode === "ATTENDEE"
                ? "bg-[#1E88E5] text-white shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Attendees Pay
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          {feeMode === "ORGANIZER"
            ? "Platform fee (~5%) is deducted from your revenue"
            : "Attendees pay the platform fee on top of the ticket price"}
        </div>
      </div>

      {/* Revenue projection */}
      {ticketCategories.some((cat) => cat.price > 0) && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 space-y-2">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Revenue Projection (if all tickets sell)</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Gross Revenue</span>
              <span className="font-medium">{formatPrice(totalGrossRevenue)}</span>
            </div>
            {feeMode === "ORGANIZER" && (
              <>
                <div className="flex justify-between text-red-500">
                  <span>Platform Fee (~5%)</span>
                  <span className="font-medium">-{formatPrice(estimatedServiceFee)}</span>
                </div>
                <div className="flex justify-between text-green-800 font-bold pt-2 border-t border-green-200">
                  <span>Your Net Revenue</span>
                  <span className="text-base">{formatPrice(netRevenue)}</span>
                </div>
              </>
            )}
            {feeMode === "ATTENDEE" && (
              <p className="text-xs text-green-700 pt-1">
                You keep the full {formatPrice(totalGrossRevenue)}. Attendees pay ~{formatPrice(estimatedServiceFee)} extra in platform fees.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {onConfirmChange && (
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
          />
          <span className="text-sm text-gray-700">I have reviewed all event details and confirm they are correct.</span>
        </label>
      )}
    </div>
  );
}
