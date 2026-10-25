import User from './users.model.js';
import Bookmark from '../bookmarks/bookmarks.model.js';
import Match from '../chat/matches.model.js';
import Message from '../chat/message.model.js';
import MatchRequest from '../matchmaking/matchrequest.model.js';
import Meetup from '../meetups/meetups.model.js';
import Report from '../reports/reports.model.js';
import { VerificationRequest } from '../verification/verification.model.js';
import { calculateProfileCompletion } from './completion.util.js';
import { enqueuePhotoModerationJob } from '../moderation/moderation.queue.js';
import { getRedisClient, isRedisHealthy } from '../../config/redis.js';

async function invalidateUserCaches(userId) {
  if (!userId) return;
  try {
    if (isRedisHealthy()) {
      const redis = getRedisClient();
      const uid = userId.toString();
      await redis.del(`user_session:${uid}`, `match_feed:${uid}`);
    }
  } catch (err) {
    console.warn('[users] Failed to invalidate Redis user cache:', err.message);
  }
}

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
  await invalidateUserCaches(userId);
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

  if (data.isFrozen !== undefined || data.isPaused !== undefined) {
    const nextVal = Boolean(data.isFrozen !== undefined ? data.isFrozen : data.isPaused);
    user.isFrozen = nextVal;
    user.frozenAt = nextVal ? (user.frozenAt || new Date()) : null;
  }

  if (data.notificationPreferences) {
    user.notificationPreferences = {
      ...(user.notificationPreferences?.toObject?.() || user.notificationPreferences || {}),
      ...data.notificationPreferences,
    };
  }

  user.profileCompletionPercent = calculateProfileCompletion(user);
  await user.save();
  await invalidateUserCaches(userId);
  return user;
}

async function freezeAccount(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isFrozen: true,
      frozenAt: new Date(),
    },
    { new: true }
  ).select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  await invalidateUserCaches(userId);
  return user;
}

async function unfreezeAccount(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isFrozen: false,
      frozenAt: null,
    },
    { new: true }
  ).select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  await invalidateUserCaches(userId);
  return user;
}

/**
 * Permanently delete user account and cascade purge all associated data across the entire database.
 */
async function deleteAccount(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  // 1. Delete all bookmarks created by or targeting this user
  await Bookmark.deleteMany({
    $or: [{ userId }, { bookmarkedUserId: userId }],
  });

  // 2. Delete all match requests sent by or sent to this user
  await MatchRequest.deleteMany({
    $or: [{ fromUser: userId }, { toUser: userId }],
  });

  // 3. Find and delete all matches involving this user, plus associated messages and meetups
  const matches = await Match.find({
    $or: [{ userA: userId }, { userB: userId }],
  }).select('_id');

  const matchIds = matches.map((m) => m._id);
  if (matchIds.length > 0) {
    await Message.deleteMany({ matchId: { $in: matchIds } });
    await Meetup.deleteMany({ matchId: { $in: matchIds } });
    await Match.deleteMany({ _id: { $in: matchIds } });
  }

  // Also clean up any orphan messages or meetups directly attributed to this user
  await Message.deleteMany({ senderId: userId });
  await Meetup.deleteMany({ proposedBy: userId });

  // 4. Delete verification requests
  await VerificationRequest.deleteMany({ userId });

  // 5. Delete safety reports involving this user
  await Report.deleteMany({
    $or: [{ reporterId: userId }, { reportedUserId: userId }],
  });

  // 6. Delete the user document completely
  await User.findByIdAndDelete(userId);

  // 7. Invalidate caches
  await invalidateUserCaches(userId);

  return { success: true };
}

async function getUserProfileById(userId) {
  const user = await User.findById(userId)
    .select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires')
    .lean();
  if (!user || user.suspended) {
    throw new UsersError('User profile not found.', 404);
  }
  return user;
}

export {
  submitQuestionnaire,
  updateProfile,
  freezeAccount,
  unfreezeAccount,
  deleteAccount,
  getUserProfileById,
  UsersError,
};