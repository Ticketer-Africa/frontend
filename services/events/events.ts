import axios from "@/services/axios";
import { toast } from "sonner";
import {
  CreateEventDTO,
  UpdateEventDTO,
  EventFilterDTO,
  deleteEventDTO,
} from "@/types/events.type";

// FETCH all events
export const getAllEvents = async () => {
  const res = await axios.get("/events");
  return res.data;
};

// FETCH filtered events
export const getFilteredEvents = async (filters: EventFilterDTO) => {
  const res = await axios.post("/events/filter", filters);
  return res.data;
};

// CREATE an event
export const createEvent = async (formData: FormData) => {
  try {
    const res = await axios.post("/events/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    toast.success(res.data.message || "Event created successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to create event";
    toast.error(errorMessage);
    console.log(errorMessage)
    throw new Error(errorMessage);
  }
};

//Delete an event
export const deleteEvent = async (eventId: string) => {
  try {
    const res = await axios.delete(`/events/${eventId}`);
    console.log("everything is fineee");
    toast.success(res.data.message) || "Event deleted successfully";
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data.message || "Failed to delete event";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// UPDATE an event
export const updateEvent = async (eventId: string, formData: FormData) => {
  try {
    const res = await axios.patch(`/events/${eventId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Explicitly set to match createEvent
      },
    });
    toast.success(res.data.message || "Event updated successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update event";
    console.error("Update error:", errorMessage, error.response?.data);
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// TOGGLE event status
export const toggleEventStatus = async (eventId: string) => {
  try {
    const res = await axios.patch(`/events/${eventId}/toggle-status`);
    toast.success(res.data.message || "Event status toggled successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to toggle event status";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// FETCH event by ID
export const getEventById = async (eventId: string) => {
  const res = await axios.get(`/events/${eventId}`);
  return res.data;
};

// FETCH event by SLUG
export const getEventBySlug = async (slug: string) => {
  const res = await axios.get(`/events/slug/${slug}`);
  return res.data;
};

// FETCH user events
export const getUserEvents = async () => {
  const res = await axios.get("/events/user/my");
  return res.data;
};

// FETCH organizer events
export const getOrganizerEvents = async () => {
  const res = await axios.get("/events/organizer/my");
  return res.data;
};

// FETCH upcoming events
export const getUpcomingEvents = async () => {
  const res = await axios.get("/events/upcoming");
  return res.data;
};
