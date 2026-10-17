import axios from "axios";

// Set REACT_APP_API_URL when the Express server is hosted elsewhere.
export const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/$/, "");
const api = axios.create({ baseURL: API_URL, timeout: 15000 });
export const apiError = (
  error,
  fallback = "Something went wrong. Please try again.",
) => error.response?.data?.message || error.response?.data?.error || fallback;
export default api;
