import axios from "@/services/axios";
import { buildEndpoint } from "@/services/api-config";
import { toast } from "sonner";
import {
  CreateEventDTO,
  UpdateEventDTO,
  EventFilterDTO,
  deleteEventDTO,
  PriceRange,
} from "@/types/events.type";

const API_VERSION = "v1";

// FETCH price range (min and max prices across all events)
export const getPriceRange = async (): Promise<PriceRange> => {
  const res = await axios.get(buildEndpoint(API_VERSION, "events/price-range"));
  const data = res.data;

  // Handle both direct response and nested data structures
  // API might return { minPrice, maxPrice } or { data: { minPrice, maxPrice } }
  if (
    data &&
    typeof data.minPrice === "number" &&
    typeof data.maxPrice === "number"
  ) {
    return data;
  }
  if (
    data?.data &&
    typeof data.data.minPrice === "number" &&
    typeof data.data.maxPrice === "number"
  ) {
    return data.data;
  }

  // Return defaults if structure is unexpected
  console.warn("Unexpected price range response structure:", data);
  return { minPrice: 0, maxPrice: 100000 };
};

// FETCH all events with pagination and optional name search
export const getAllEvents = async (
  page?: number,
  name?: string,
  minPrice?: number,
  maxPrice?: number
) => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (name) params.append("name", name);
  if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());

  const res = await axios.get(
    buildEndpoint(
      API_VERSION,
      `events${params.toString() ? "?" + params.toString() : ""}`
    )
  );
  return res.data;
};

// // FETCH filtered events
// export const getFilteredEvents = async (filters: EventFilterDTO) => {
//   const res = await axios.post("/events/filter", filters);
//   return res.data;
// };

// CREATE an event
export const createEvent = async (formData: FormData) => {
  try {
    const res = await axios.post(
      buildEndpoint(API_VERSION, "events/create"),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    toast.success("Event created", {
      description: res.data.message || "Your event has been saved.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create event";
    toast.error("Event creation failed", { description: errorMessage });
    console.log(errorMessage);
    throw new Error(errorMessage);
  }
};

//Delete an event
export const deleteEvent = async (eventId: string) => {
  try {
    const res = await axios.delete(
      buildEndpoint(API_VERSION, `events/${eventId}`)
    );
    console.log("everything is fineee");
    toast.success("Event deleted", {
      description: res.data.message || "The event has been removed.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data.message || "Failed to delete event";
    toast.error("Deletion failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// UPDATE an event
export const updateEvent = async (eventId: string, formData: FormData) => {
  try {
    const res = await axios.patch(
      buildEndpoint(API_VERSION, `events/${eventId}`),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", // Explicitly set to match createEvent
        },
      }
    );
    toast.success("Event updated", {
      description: res.data.message || "Your changes have been saved.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update event";
    console.error("Update error:", errorMessage, error.response?.data);
    toast.error("Update failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// TOGGLE event status
export const toggleEventStatus = async (eventId: string) => {
  try {
    const res = await axios.patch(
      buildEndpoint(API_VERSION, `events/${eventId}/toggle-status`)
    );
    toast.success("Event status updated", {
      description: res.data.message || "The event visibility has been changed.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to toggle event status";
    toast.error("Status update failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// FETCH event by ID
export const getEventById = async (eventId: string) => {
  const res = await axios.get(buildEndpoint(API_VERSION, `events/${eventId}`));
  return res.data;
};

// FETCH event by SLUG
export const getEventBySlug = async (slug: string) => {
  const res = await axios.get(
    buildEndpoint(API_VERSION, `events/slug/${slug}`)
  );
  return res.data;
};

// FETCH user events
export const getUserEvents = async () => {
  const res = await axios.get(buildEndpoint(API_VERSION, "events/user/my"));
  return res.data;
};

// FETCH organizer events
export const getOrganizerEvents = async () => {
  const res = await axios.get(
    buildEndpoint(API_VERSION, "events/organizer/my")
  );
  return res.data;
};

// FETCH upcoming events
export const getUpcomingEvents = async () => {
  const res = await axios.get(buildEndpoint(API_VERSION, "events/upcoming"));
  return res.data;
};
