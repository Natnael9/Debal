import { updateMyProfile } from "./profileService";
import { apiPost } from "./api";

export async function updateUserSettings(settingsData) {
  // Uses your existing PATCH /api/v1/users/me route
  return await updateMyProfile(settingsData);
}

export async function changePassword(passwordData) {
  // If backend password route isn't built yet, you can hook this up when ready
  return await apiPost("/users/change-password", passwordData);
}