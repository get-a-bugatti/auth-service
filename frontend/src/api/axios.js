import axios from "axios";
import { logout as logoutUser } from "../store/authSlice.js";
import store from "../store/store.js";

const getBackendUrl = () => {
  return import.meta.env.REACT_ENV === "production"
    ? import.meta.env.REACT_APP_API_URL
    : "http://localhost:8000";
};

const api = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
});

let isRefreshing;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/api/v1/auth/token")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(() => Promise.reject(error));
      }

      isRefreshing = true;

      api
        .post("/api/v1/auth/token")
        .then((response) => {
          isRefreshing = false;
          processQueue(null);

          return api(originalRequest);
        })
        .catch((refreshTokenErr) => {
          processQueue(refreshTokenErr, null);

          store.dispatch(logoutUser());

          window.location.href = "/login?error=session_expired";

          return Promise.reject(refreshTokenErr);
        });
    }
  }
);

export default api;
