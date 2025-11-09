import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Axios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token and dynamic headers from browser
Axios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("ticketer-token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      config.headers["x-client-page"] = window.location.pathname;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses globally
Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn("Unauthorized request. Token might be invalid.");
    }
    return Promise.reject(error);
  }
);

export default Axios;
