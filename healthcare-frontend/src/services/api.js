import axios from "axios";
import toast from "react-hot-toast";
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const publicAuthPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/google",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/send-otp",
      "/auth/verify-otp",
    ];
    const isPublicAuth = publicAuthPaths.some(
      (p) => config.url && config.url.startsWith(p),
    );
    if (!isPublicAuth && token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.config &&
      error.config.url &&
      error.config.url.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    if (error.response) {
      if (error.response.status === 401) {
        // Use a unique ID to prevent duplicate toasts stacking up
        toast.error("Session expired or unauthorized. Please log in.", {
          id: "auth-error",
        });

        // Clear session and force redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("userUpdated"));
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else {
        const message = error.response.data?.message || "An error occurred";
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("Unexpected error: " + error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
