import { apiGet, apiPatch } from "./api";

/**
 * Get the currently authenticated user's profile.
 * GET /api/v1/users/me
 */
export async function getMyProfile() {
  const data = await apiGet("/users/me");
  return data?.data?.user ?? data;
}

/**
 * Update the currently authenticated user's profile.
 * PATCH /api/v1/users/me
 */
export async function updateMyProfile(profileData) {
  const data = await apiPatch("/users/me", profileData);
  return data?.data?.user ?? data;
}