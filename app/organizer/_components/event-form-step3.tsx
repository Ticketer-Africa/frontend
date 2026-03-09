"use client";

import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/button";

interface Step3Props {
  watch: UseFormWatch<EventFormData>;
  setValue: UseFormSetValue<EventFormData>;
  ticketCategories: TicketCategory[];
  previewUrl: string | null;
  isConfirmed?: boolean;
  onConfirmChange?: (confirmed: boolean) => void;
}

/**
 * Step 3: Review & Submit with revenue calculations based on fee mode
 */
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
  const formattedCategory = category
    ? category.charAt(0) + category.slice(1).toLowerCase()
    : "";

  // Calculate total revenue (gross)
  const totalGrossRevenue = ticketCategories.reduce(
    (sum, cat) => sum + (cat.price || 0) * (cat.maxTickets || 0),
    0,
  );

  // Estimate service fee (typical platform fee ~5%)
  const estimatedServiceFee = Math.round(totalGrossRevenue * 0.05);

  // Net revenue after fees
  const netRevenue = totalGrossRevenue - estimatedServiceFee;

  return (
    <div className="space-y-6">
      {/* Mobile-first layout: stack on mobile, grid on tablet+ */}
      <div className="flex flex-col space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
        <div className="space-y-4">
          <h3 className="font-semibold">Event Details</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600 block text-xs mb-1">Name:</span>
              <p className="font-medium">{watch("name")}</p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">
                Category:
              </span>
              <p className="font-medium">{formattedCategory}</p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">
                Description:
              </span>
              <p className="font-medium whitespace-pre-wrap line-clamp-3 text-xs">
                {watch("description")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Date & Location</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600 block text-xs mb-1">
                Location:
              </span>
              <p className="font-medium">{watch("location")}</p>
            </div>
            <div>
              <span className="text-gray-600 block text-xs mb-1">
                Date & Time:
              </span>
              <p className="font-medium">
                {watch("date") && new Date(watch("date")).toLocaleDateString()}{" "}
                at {watch("time")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Preview - mobile first */}
      {previewUrl && (
        <div className="w-full">
          <h3 className="font-semibold mb-2 text-sm">Banner Preview</h3>
          <img
            src={previewUrl}
            alt="Banner preview"
            className="w-full h-40 md:h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Ticket Categories */}
      <div className="w-full">
        <h3 className="font-semibold mb-3 text-sm">Ticket Categories</h3>
        <div className="flex flex-col space-y-2">
          {ticketCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
            >
              <div className="flex-1">
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-gray-600">
                  {cat.maxTickets} ticket{cat.maxTickets !== 1 ? "s" : ""}{" "}
                  available
                  {cat.maxAdmissions && cat.maxAdmissions > 1
                    ? ` • ${cat.maxAdmissions} people per ticket`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(cat.price)}</p>
                <p className="text-xs text-gray-600">per ticket</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Mode Toggle - Switch style */}
      <div className="w-full">
        <h3 className="font-semibold mb-3 text-sm">Service Fees</h3>
        <p className="text-xs text-gray-600 mb-3">
          Who pays the platform service fees?
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg mb-3">
          <button
            type="button"
            onClick={() => setValue("feeMode", "ORGANIZER")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              feeMode === "ORGANIZER"
                ? "bg-[#1E88E5] text-white shadow-md"
                : "bg-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            You Pay
          </button>
          <button
            type="button"
            onClick={() => setValue("feeMode", "ATTENDEE")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              feeMode === "ATTENDEE"
                ? "bg-[#1E88E5] text-white shadow-md"
                : "bg-transparent text-gray-700 hover:text-gray-900"
            }`}
          >
            Attendees Pay
          </button>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">
            {feeMode === "ORGANIZER"
              ? "✓ You cover platform fees"
              : "✓ Fees added to ticket price"}
          </p>
          <p className="text-xs text-blue-600">
            {feeMode === "ORGANIZER"
              ? "Platform fee (~5%) is deducted from your revenue"
              : "Attendees pay the platform fee on top of ticket price"}
          </p>
        </div>
      </div>

      {/* Revenue Projection with Fee Mode Calculations */}
      {ticketCategories.some((cat) => cat.price > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
          <h4 className="font-medium text-green-900 mb-3 text-sm">
            Revenue Projection (if all tickets sell)
          </h4>
          <div className="space-y-3 text-xs text-green-800">
            <div className="flex justify-between pb-2 border-b border-green-200">
              <span className="text-gray-700">Gross Revenue:</span>
              <span className="font-semibold">
                {formatPrice(totalGrossRevenue)}
              </span>
            </div>

            {feeMode === "ORGANIZER" && (
              <>
                <div className="flex justify-between text-red-600">
                  <span className="text-gray-700">Platform Fee (~5%):</span>
                  <span className="font-semibold">
                    -{formatPrice(estimatedServiceFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-300 text-green-900 font-bold">
                  <span>Net Revenue (Your earnings):</span>
                  <span className="text-lg">{formatPrice(netRevenue)}</span>
                </div>
              </>
            )}

            {feeMode === "ATTENDEE" && (
              <>
                <div className="bg-white/50 p-2 rounded border border-green-200">
                  <p className="text-green-700 font-medium mb-1">
                    Your revenue: {formatPrice(totalGrossRevenue)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Attendees will pay ~{formatPrice(estimatedServiceFee)} extra
                    in platform fees
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Checkbox */}
      {onConfirmChange && (
        <div className="w-full pt-4 border-t">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => onConfirmChange(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1E88E5] focus:ring-[#1E88E5]"
            />
            <span className="text-sm text-gray-700">
              I have reviewed all event details and confirm they are correct.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
