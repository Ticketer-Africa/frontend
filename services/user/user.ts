import axios from "@/services/axios";
import { toast } from "sonner";
import {
  UpdateUserDto,
  User,
  BecomeOrganizerResponse,
} from "@/types/user.type";
import { buildEndpoint } from "../api-config";

const API_VERSION = "v1";
// UPDATE user
export const updateUser = async (
  formData: FormData
): Promise<{ message: string; user: User }> => {
  try {
    const res = await axios.put(
      buildEndpoint(API_VERSION, "users/update"),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    toast.success("Profile updated", {
      description: res.data.message || "Your profile changes have been saved.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update user profile";
    toast.error("Profile update failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};

// BECOME organizer
export const becomeOrganizer = async (
  email: string
): Promise<BecomeOrganizerResponse> => {
  try {
    const res = await axios.patch(
      buildEndpoint(API_VERSION, "users/become-organizer"),
      { email }
    );
    toast.success("Organizer request sent", {
      description: res.data.message || "We'll review your request and follow up by email.",
    });
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to request organizer status";
    toast.error("Request failed", { description: errorMessage });
    throw new Error(errorMessage);
  }
};
