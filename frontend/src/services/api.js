/**
 * Central API client for Debal.
 *
 * All requests are proxied through Vite's dev-server to `localhost:4001`,
 * so the base URL is always the relative path `/api/v1`.
 *
 * Features:
 *  - Attaches `Authorization: Bearer <token>` from localStorage automatically
 *  - On 401, attempts one silent token refresh via the HttpOnly refreshToken
 *    cookie, then retries the original request once
 *  - Sanitizes technical/database errors into clean, user-friendly messages
 */

const BASE = "/api/v1";
const TOKEN_KEY = "accessToken";

// ─────────────────────────────────────────
//  Token helpers
// ─────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─────────────────────────────────────────
//  Internal fetch wrapper
// ─────────────────────────────────────────
let _isRefreshing = false;

async function _refreshAccessToken() {
  if (_isRefreshing) return null;
  _isRefreshing = true;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the HttpOnly refreshToken cookie
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken = data?.data?.accessToken;
    if (newToken) setToken(newToken);
    return newToken;
  } catch {
    return null;
  } finally {
    _isRefreshing = false;
  }
}

async function _fetch(path, options = {}, retried = false) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    const networkError = new Error("Unable to connect to the server. Please check your internet connection.");
    networkError.status = 0;
    throw networkError;
  }

  // Silent refresh on first 401 for authenticated endpoints (exclude auth/login and auth/register)
  const isAuthEndpoint = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/refresh');
  if (res.status === 401 && !retried && !isAuthEndpoint) {
    const newToken = await _refreshAccessToken();
    if (newToken) return _fetch(path, options, true);
    // Refresh failed — clear stale token
    clearToken();
  }

  if (!res.ok) {
    let message = "";
    try {
      const err = await res.json();
      const raw = err?.message;
      if (typeof raw === 'string') {
        message = raw;
      } else if (Array.isArray(raw)) {
        message = raw.map((e) => e?.message ?? JSON.stringify(e)).join('; ');
      } else if (typeof raw === 'object' && raw !== null) {
        // Zod flatten() format
        const fieldMsgs = Object.entries(raw.fieldErrors || {})
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ');
        const formMsgs = Array.isArray(raw.formErrors) ? raw.formErrors.join('; ') : '';
        message = [formMsgs, fieldMsgs].filter(Boolean).join('; ') || JSON.stringify(raw);
      } else if (typeof err?.error === 'string') {
        message = err.error;
      }
    } catch { /* ignore parse errors */ }

    // Clean user-friendly message mapping
    if (
      res.status >= 500 ||
      message.includes('Mongo') ||
      message.includes('ECONNRESET') ||
      message.includes('ETIMEDOUT') ||
      message.includes('Request failed:') ||
      message.includes('connection <monitor>')
    ) {
      message = "Service temporarily unavailable. Please try again in a few moments.";
    } else if (res.status === 401) {
      if (path.includes('/auth/login')) {
        message = "Invalid email or password. Please check your credentials and try again.";
      } else {
        message = "Your session has expired. Please log in again.";
      }
    } else if (res.status === 403) {
      message = "Access denied. You do not have permission for this action.";
    } else if (res.status === 404) {
      message = "The requested resource could not be found.";
    } else if (!message) {
      message = "An unexpected error occurred. Please try again.";
    }

    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

// ─────────────────────────────────────────
//  Public helpers
// ─────────────────────────────────────────
export const apiGet = (path, opts = {}) =>
  _fetch(path, { method: "GET", ...opts });

export const apiPost = (path, body, opts = {}) =>
  _fetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiPatch = (path, body, opts = {}) =>
  _fetch(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...opts,
  });

export const apiDelete = (path, opts = {}) =>
  _fetch(path, { method: "DELETE", ...opts });

export default { apiGet, apiPost, apiPatch, apiDelete, getToken, setToken, clearToken };
