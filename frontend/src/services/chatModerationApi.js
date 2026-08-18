const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
 * Report a user
 *
 * POST /reports
 *
 * Body:
 * {
 *   userId,
 *   reason,
 *   details
 * }
 */
export async function reportUser({ userId, reason, details }) {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      userId,
      reason,
      details,
    }),
  });

  if (!response.ok) {
    let message = "Failed to submit report.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  // Any 2xx response is considered successful
  return response;
}

/*
 * Block a user
 *
 * POST /blocks/:userId
 */
export async function blockUser(userId) {
  const response = await fetch(`${API_BASE_URL}/blocks/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to block user.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  // Any 2xx response is considered successful
  return response;
}