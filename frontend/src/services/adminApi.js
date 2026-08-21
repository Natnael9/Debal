import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

const ADMIN_TOKEN_KEY = "adminToken";

/** Build headers with the admin token for direct fetch calls */
function adminHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Thin wrapper that injects admin token */
async function adminFetch(path, opts = {}) {
  const res = await fetch(`/api/v1${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...adminHeaders(),
      ...(opts.headers || {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const e = new Error(err?.message || `Request failed: ${res.status}`);
    e.status = res.status;
    throw e;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Dashboard Stats ──────────────────────────────────────────────────────────
export const getAdminStats = () =>
  adminFetch("/admin/stats");

// ── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return adminFetch(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
};

// ── Users ────────────────────────────────────────────────────────────────────
export const getAdminUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return adminFetch(`/admin/users${qs ? `?${qs}` : ""}`);
};

export const getAdminUserDetails = (userId) =>
  adminFetch(`/admin/users/${userId}`);

export const suspendUser = (userId) =>
  adminFetch(`/admin/users/${userId}/suspend`, { method: "PATCH" });

export const reinstateUser = (userId) =>
  adminFetch(`/admin/users/${userId}/reinstate`, { method: "PATCH" });

export const deleteUser = (userId) =>
  adminFetch(`/admin/users/${userId}`, { method: "DELETE" });

// ── Verifications ────────────────────────────────────────────────────────────
export const getVerificationQueue = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return adminFetch(`/admin/verifications${qs ? `?${qs}` : ""}`);
};

export const getVerificationDetail = (id) =>
  adminFetch(`/admin/verifications/${id}`);

export const decideVerification = (id, decision, notes = "") =>
  adminFetch(`/admin/verifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ decision, notes }),
  });

// ── Reports ──────────────────────────────────────────────────────────────────
/** Admin reports endpoint – uses GET /api/v1/admin/reports (if wired) or falls back to mocks */
export const getAdminReports = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return adminFetch(`/admin/reports${qs ? `?${qs}` : ""}`);
};

// ── Photo Moderation ─────────────────────────────────────────────────────────
export const getFlaggedPhotos = () =>
  adminFetch("/admin/photo-review");

export const decidePhotoReview = (userId, decision) =>
  adminFetch(`/admin/photo-review/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ decision }),
  });
