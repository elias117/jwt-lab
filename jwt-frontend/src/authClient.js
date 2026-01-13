import axios from "axios";

const API_URL = "http://localhost:3000";

/**
 * In-memory access token
 * (cleared on refresh / reload)
 */
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/**
 * Axios instance
 * - credentials: true → cookies included (refresh token)
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔑 REQUIRED for cookies
});

/**
 * LOGIN
 * - receives access token in JSON
 * - refresh token set as HttpOnly cookie by server
 */
export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  setAccessToken(res.data.accessToken);
  return res.data;
}

/**
 * REFRESH ACCESS TOKEN
 * - browser auto-sends refresh cookie
 */
export async function refreshAccessToken() {
  const res = await api.post("/refresh");
  setAccessToken(res.data.accessToken);
  return res.data.accessToken;
}

/**
 * LOGOUT
 * - revokes refresh token
 * - clears cookie server-side
 */
export async function logout() {
  await api.post("/logout");
  setAccessToken(null);
}

/**
 * REQUEST INTERCEPTOR
 * - runs BEFORE every request
 * - attaches Authorization header if access token exists
 */
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - runs AFTER responses
 * - if 401 → try refresh once → retry original request
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If access token expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return api(originalRequest); // retry original request
      } catch {
        setAccessToken(null);
        return Promise.reject(
          new Error("Session expired. Please log in again.")
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;
