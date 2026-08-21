import User from './users.model.js';
import { calculateProfileCompletion } from './completion.util.js';
import { enqueuePhotoModerationJob } from '../moderation/moderation.queue.js';

class UsersError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function submitQuestionnaire(userId, data) {
  const { housingStatus, age, gender, bio, budget, location, maxDistance, lifestyle, teamUpEnabled } = data;

  const user = await User.findById(userId);
  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  user.housingStatus = housingStatus;
  user.age = age;
  user.gender = gender;
  if (bio !== undefined) {
    user.bio = bio;
  }

  user.preferences = {
    budgetMin: budget.budgetMin,
    budgetMax: budget.budgetMax,
    cleanliness: lifestyle.cleanliness,
    sleepSchedule: lifestyle.sleepSchedule,
    smokingOk: lifestyle.smokingOk,
    petsOk: lifestyle.petsOk,
  };

  user.location = {
    type: 'Point',
    coordinates: location.coordinates,
    displayName: location.displayName,
  };
  user.maxDistance = maxDistance;

  user.teamUpEnabled = Boolean(teamUpEnabled);
  user.questionnaireCompleted = true;
  user.onboardingCompletedAt = new Date();

  user.profileCompletionPercent = calculateProfileCompletion(user);

  await user.save();
  return user;
}

/**
 * PATCH /users/me — edit any profile field after initial submission (FR-3.4),
 * recomputing profileCompletionPercent on every save.
 */
async function updateProfile(userId, data) {
  const user = await User.findById(userId);
  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  const { name, age, gender, bio, avatarUrl, housingStatus, teamUpEnabled, budget, location, maxDistance, lifestyle } = data;

  if (name !== undefined) user.name = name;
  if (age !== undefined) user.age = age;
  if (gender !== undefined) user.gender = gender;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl !== undefined) {
    user.avatarUrl = avatarUrl;
    user.photoModerationStatus = 'pending';
    if (avatarUrl) {
      await enqueuePhotoModerationJob({ userId: user._id.toString(), imageUrl: avatarUrl });
    }
  }
  if (housingStatus !== undefined) user.housingStatus = housingStatus;
  if (teamUpEnabled !== undefined) user.teamUpEnabled = teamUpEnabled;

  if (budget) {
    user.preferences = user.preferences || {};
    if (budget.budgetMin !== undefined) user.preferences.budgetMin = budget.budgetMin;
    if (budget.budgetMax !== undefined) user.preferences.budgetMax = budget.budgetMax;
  }

  if (lifestyle) {
    user.preferences = user.preferences || {};
    if (lifestyle.cleanliness !== undefined) user.preferences.cleanliness = lifestyle.cleanliness;
    if (lifestyle.sleepSchedule !== undefined) user.preferences.sleepSchedule = lifestyle.sleepSchedule;
    if (lifestyle.smokingOk !== undefined) user.preferences.smokingOk = lifestyle.smokingOk;
    if (lifestyle.petsOk !== undefined) user.preferences.petsOk = lifestyle.petsOk;
  }

  if (location) {
    user.location = {
      type: 'Point',
      coordinates: location.coordinates,
      displayName: location.displayName !== undefined ? location.displayName : user.location?.displayName,
    };
  }

  if (maxDistance !== undefined) user.maxDistance = maxDistance;

  user.profileCompletionPercent = calculateProfileCompletion(user);
  await user.save();
  return user;
}

async function getUserProfileById(userId) {
  const user = await User.findById(userId).select(
    '-passwordHash -refreshTokenHashes -idNumberHash'
  );
  if (!user || user.suspended) {
    throw new UsersError('User profile not found.', 404);
  }
  return user;
}

export { submitQuestionnaire, updateProfile, getUserProfileById, UsersError };