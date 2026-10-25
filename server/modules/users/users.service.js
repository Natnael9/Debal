import bcrypt from 'bcrypt';
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

async function invalidateUserCaches(userId, { clearAllMatchFeeds = false } = {}) {
  if (!userId) return;
  try {
    if (isRedisHealthy()) {
      const redis = getRedisClient();
      const uid = userId.toString();
      await redis.del(`user_session:${uid}`, `match_feed:${uid}`);
      if (clearAllMatchFeeds) {
        // Clear all cached match feeds so paused profile immediately vanishes
        const keys = await redis.keys('match_feed:*');
        if (keys && keys.length > 0) {
          await redis.del(...keys);
        }
      }
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
  if (data.phone !== undefined) user.phone = data.phone;

  let pauseToggled = false;
  if (data.pauseProfile !== undefined || data.isFrozen !== undefined || data.isPaused !== undefined) {
    const nextVal = Boolean(
      data.pauseProfile !== undefined ? data.pauseProfile :
      data.isFrozen !== undefined ? data.isFrozen : data.isPaused
    );
    user.pauseProfile = nextVal;
    user.isFrozen = nextVal;
    user.frozenAt = nextVal ? (user.frozenAt || new Date()) : null;
    pauseToggled = true;
  }

  if (data.notificationSettings) {
    user.notificationSettings = {
      ...(user.notificationSettings?.toObject?.() || user.notificationSettings || {}),
      ...data.notificationSettings,
    };
    user.notificationPreferences = {
      ...(user.notificationPreferences?.toObject?.() || user.notificationPreferences || {}),
      newChatRequest: data.notificationSettings.chatRequests ?? user.notificationPreferences?.newChatRequest ?? true,
      requestAccepted: data.notificationSettings.acceptedRequests ?? user.notificationPreferences?.requestAccepted ?? true,
      newMessage: data.notificationSettings.messages ?? user.notificationPreferences?.newMessage ?? true,
      meetupUpdate: data.notificationSettings.meetupUpdates ?? user.notificationPreferences?.meetupUpdate ?? true,
      reportStatus: data.notificationSettings.reportStatus ?? user.notificationPreferences?.reportStatus ?? true,
    };
  }

  if (data.notificationPreferences) {
    user.notificationPreferences = {
      ...(user.notificationPreferences?.toObject?.() || user.notificationPreferences || {}),
      ...data.notificationPreferences,
    };
    user.notificationSettings = {
      ...(user.notificationSettings?.toObject?.() || user.notificationSettings || {}),
      chatRequests: data.notificationPreferences.newChatRequest ?? user.notificationSettings?.chatRequests ?? true,
      acceptedRequests: data.notificationPreferences.requestAccepted ?? user.notificationSettings?.acceptedRequests ?? true,
      messages: data.notificationPreferences.newMessage ?? user.notificationSettings?.messages ?? true,
      meetupUpdates: data.notificationPreferences.meetupUpdate ?? user.notificationSettings?.meetupUpdates ?? true,
      reportStatus: data.notificationPreferences.reportStatus ?? user.notificationSettings?.reportStatus ?? true,
    };
  }

  user.profileCompletionPercent = calculateProfileCompletion(user);
  await user.save();
  await invalidateUserCaches(userId, { clearAllMatchFeeds: pauseToggled });
  return user;
}

async function freezeAccount(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isFrozen: true,
      pauseProfile: true,
      frozenAt: new Date(),
    },
    { new: true }
  ).select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  await invalidateUserCaches(userId, { clearAllMatchFeeds: true });
  return user;
}

async function unfreezeAccount(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isFrozen: false,
      pauseProfile: false,
      frozenAt: null,
    },
    { new: true }
  ).select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires');

  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  await invalidateUserCaches(userId, { clearAllMatchFeeds: true });
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

async function changeUserPassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new UsersError('Current password and new password are required.', 400);
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new UsersError('New password must be at least 6 characters long.', 400);
  }

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new UsersError('User not found.', 404);
  }

  if (!user.passwordHash) {
    throw new UsersError('This account was created via social login and does not have a password set.', 400);
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new UsersError('Current password is incorrect.', 400);
  }

  const hash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = hash;
  await user.save();

  await invalidateUserCaches(userId);
  return { success: true, message: 'Password changed successfully.' };
}

export {
  submitQuestionnaire,
  updateProfile,
  freezeAccount,
  unfreezeAccount,
  deleteAccount,
  changeUserPassword,
  getUserProfileById,
  UsersError,
};