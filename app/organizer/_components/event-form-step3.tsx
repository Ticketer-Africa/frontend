"use client";

import { UseFormWatch } from "react-hook-form";
import { EventFormData, TicketCategory } from "./event-form-schema";
import { formatPrice } from "@/lib/helpers";

interface Step3Props {
  watch: UseFormWatch<EventFormData>;
  ticketCategories: TicketCategory[];
  previewUrl: string | null;
}

/**
 * Step 3: Review & Submit
 */
export function EventFormStep3({
  watch,
  ticketCategories,
  previewUrl,
}: Step3Props) {
  const category = watch("category");
  const formattedCategory = category
    ? category.charAt(0) + category.slice(1).toLowerCase()
    : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Event Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{watch("name")}</p>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <p className="font-medium">{formattedCategory}</p>
            </div>
            <div>
              <span className="text-gray-600">Description:</span>
              <p className="font-medium line-clamp-3">{watch("description")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Date & Pricing</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Location:</span>
              <p className="font-medium">{watch("location")}</p>
            </div>
            <div>
              <span className="text-gray-600">Date & Time:</span>
              <p className="font-medium">
                {watch("date") && new Date(watch("date")).toLocaleDateString()}{" "}
                at {watch("time")}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Ticket Categories:</span>
              {ticketCategories.map((cat) => (
                <p key={cat.id} className="font-medium">
                  {cat.name}: {formatPrice(cat.price)} ({cat.maxTickets}{" "}
                  tickets)
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {previewUrl && (
        <div>
          <h3 className="font-semibold mb-2">Banner Preview</h3>
          <img
            src={previewUrl}
            alt="Banner preview"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {ticketCategories.some((cat) => cat.price > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            Revenue Projection
          </h4>
          <div className="space-y-1 text-sm text-green-800">
            <div className="flex justify-between">
              <span>If all tickets sell:</span>
              <span className="font-medium">
                {formatPrice(
                  ticketCategories.reduce(
                    (sum, cat) => sum + cat.price * cat.maxTickets,
                    0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
