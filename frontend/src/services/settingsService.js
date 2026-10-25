import { updateMyProfile } from "./profileService";
import { apiPost, apiDelete } from "./api";

export async function updateUserSettings(settingsData) {
  // Uses your existing PATCH /api/v1/users/me route
  return await updateMyProfile(settingsData);
}

export async function freezeAccount() {
  try {
    const res = await apiPost("/users/me/freeze", {});
    return res?.data?.user;
  } catch (err) {
    if (err.status === 404) {
      return await updateMyProfile({ isFrozen: true, isPaused: true });
    }
    throw err;
  }
}

export async function unfreezeAccount() {
  try {
    const res = await apiPost("/users/me/unfreeze", {});
    return res?.data?.user;
  } catch (err) {
    if (err.status === 404) {
      return await updateMyProfile({ isFrozen: false, isPaused: false });
    }
    throw err;
  }
}

export async function deleteMyAccount() {
  return await apiDelete("/users/me");
}

export async function changePassword(passwordData) {
  // If backend password route isn't built yet, you can hook this up when ready
  return await apiPost("/users/change-password", passwordData);
}