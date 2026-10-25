import { apiPost, apiDelete } from "./api";

/**
 * Report a user.
 * POST /api/v1/reports
 *
 * Note: backend expects `reportedUserId`, not `userId`.
 */
export async function reportUser({ userId, reason, details }) {
  return apiPost("/reports", {
    reportedUserId: userId,   // backend field name
    reason,
    details,
  });
}

/**
 * Block a user.
 * POST /api/v1/blocks/:userId
 */
export async function blockUser(userId) {
  return apiPost(`/blocks/${userId}`);
}

/**
 * Unblock a user.
 * DELETE /api/v1/blocks/:userId
 */
export async function unblockUser(userId) {
  return apiDelete(`/blocks/${userId}`);
}