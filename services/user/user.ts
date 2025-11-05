import axios from "@/services/axios";
import { toast } from "sonner";
import {
  UpdateUserDto,
  User,
  BecomeOrganizerResponse,
} from "@/types/user.type";

// UPDATE user
export const updateUser = async (
  formData: FormData
): Promise<{ message: string; user: User }> => {
  try {
    const res = await axios.put("/users/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success(res.data.message || "User profile updated successfully");
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to update user profile";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// BECOME organizer
export const becomeOrganizer = async (
  email: string
): Promise<BecomeOrganizerResponse> => {
  try {
    const res = await axios.patch("/users/become-organizer", { email });
    toast.success(
      res.data.message || "Successfully requested organizer status"
    );
    return res.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Failed to request organizer status";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
