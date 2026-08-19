const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
 * Get the currently authenticated user's profile
 *
 * GET /users/me
 */
export async function getMyProfile() {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Failed to load profile.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return response.json();
}

/*
 * Update the currently authenticated user's profile
 *
 * PATCH /users/me
 *
 * The backend accepts only the fields being changed.
 */
export async function updateMyProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    let message = "Failed to update profile.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  return response.json();
}profile