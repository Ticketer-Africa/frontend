import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Axios = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      config.headers["x-client-page"] = window.location.pathname;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling for redirection
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isGuestResaleRequest =
      error.config?.url?.includes("tickets/resale/") ||
      error.config?.url?.includes("payment/resolve-account");
    if (
      error.response &&
      [401].includes(error.response.status) &&
      !isGuestResaleRequest
    ) {
      // session expired
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default Axios;
