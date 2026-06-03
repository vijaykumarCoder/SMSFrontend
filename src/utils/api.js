import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // sends httpOnly refresh token cookie automatically
});

// Module-level token ref — updated by AuthContext
let _accessToken = null;
export const setToken  = (t) => { _accessToken = t; };
export const clearToken = () => { _accessToken = null; };

// ── Attach access token to every request ──────────────────────────
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ── Auto-refresh on 401 with request queuing ───────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) =>
  failedQueue.splice(0).forEach((p) => (error ? p.reject(error) : p.resolve(token)));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    
    if (original.url?.includes("/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue concurrent requests while refresh is in progress
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
    }

    original._retry  = true;
    isRefreshing     = true;

    try {
      const { data } = await api.post("/users/refresh"); // cookie sent automatically
      _accessToken = data.access_token;
      setToken(_accessToken);
      processQueue(null, _accessToken);
      original.headers.Authorization = `Bearer ${_accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      clearToken();
      window.dispatchEvent(new Event("auth:logout")); // signal app to redirect
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;