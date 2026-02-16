import axios from "@/services/axios";
import { throwDeprecation } from "process";
import { toast } from "sonner";
import { buildEndpoint } from "../api-config";

const API_VERSION = "v1";

export const getAdminStats = async () => {
  try {
    const res = await axios.get(buildEndpoint(API_VERSION, "admin/stats")); // baseURL already includes /v1
    return res.data;
  } catch (error: any) {
    // Axios errors have a response object
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};
export const getAdminEvents = async () => {
  try {
    const res = await axios.get(buildEndpoint(API_VERSION, "admin/events"));
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};

export const getAdminUsers = async () => {
  try {
    const res = await axios.get(buildEndpoint(API_VERSION, "admin/users"));
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};

export const adminToggleEvent = async (eventId: string) => {
  const res = await axios.patch(
    buildEndpoint(API_VERSION, `admin/events/${eventId}/toggle`)
  );
  return res.data;
};

export const getAdminTransactions = async () => {
  try {
    const res = await axios.get(
      buildEndpoint(API_VERSION, "admin/transactions")
    );
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};

export const getAdminOrganizers = async () => {
  const res = await axios.get(buildEndpoint(API_VERSION, "admin/organizers"));
  return res.data;
};

export const getAdminUserDetails = async (userId: string) => {
  const res = await axios.get(
    buildEndpoint(API_VERSION, `admin/users/${userId}`)
  );
  return res.data;
};

export const getAdminRevenue = async () => {
  const res = await axios.get(buildEndpoint(API_VERSION, "admin/revenue"));
  return res.data;
};

export const getAdminDailyRevenue = async () => {
  try {
    const res = await axios.get(
      buildEndpoint(API_VERSION, "admin/revenue/daily")
    );
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};

export const getEventCategories = async () => {
  try {
    const res = await axios.get(
      buildEndpoint(API_VERSION, "admin/events/categories")
    );
    return res.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      throw new Error(error.message);
    }
  }
};
