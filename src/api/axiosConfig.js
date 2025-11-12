import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

api.interceptors.request.use((config) => {
  // Get token from Zustand store (which persists to localStorage as "auth-storage")
  const authData = localStorage.getItem("auth-storage");
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Failed to parse auth storage:", err);
    }
  }
  return config;
});

export default api;
