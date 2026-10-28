import mongoose from 'mongoose';
import Bookmark from './bookmarks.model.js';
import User from '../users/users.model.js';
import { MatchRequest } from '../matchmaking/matchrequest.model.js';
import { Match } from '../chat/matches.model.js';

class BookmarksError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * POST /bookmarks — FR-6.1: bookmark a candidate without sending a chat request.
 */
async function addBookmark(userId, bookmarkedUserId) {
  if (!mongoose.Types.ObjectId.isValid(bookmarkedUserId)) {
    throw new BookmarksError('Invalid user id.', 422);
  }

  if (String(userId) === String(bookmarkedUserId)) {
    throw new BookmarksError('You cannot bookmark yourself.', 400);
  }

  const candidate = await User.findById(bookmarkedUserId);
  if (!candidate) {
    throw new BookmarksError('That user does not exist.', 404);
  }

  try {
    const bookmark = await Bookmark.create({ userId, bookmarkedUserId });
    return bookmark;
  } catch (err) {
    // Mongo duplicate-key error from the compound unique index
    if (err.code === 11000) {
      throw new BookmarksError('You already bookmarked this user.', 409);
    }
    throw err;
  }
}

/**
 * GET /bookmarks — FR-6.2: view the bookmarked list, with actual profile
 * info rather than bare ids.
 */
async function listBookmarks(userId) {
  const [bookmarks, sentPendingRequests, receivedPendingRequests, acceptedRequests, activeMatches] = await Promise.all([
    Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .populate('bookmarkedUserId', 'name age gender bio avatarUrl housingStatus location preferences')
      .lean(),
    MatchRequest.find({
      fromUser: userId,
      status: 'pending',
    }).select('toUser').lean(),
    MatchRequest.find({
      toUser: userId,
      status: 'pending',
    }).select('fromUser').lean(),
    MatchRequest.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      status: 'accepted',
    }).select('fromUser toUser').lean(),
    Match.find({
      $or: [{ userA: userId }, { userB: userId }],
      status: 'active',
    }).select('userA userB').lean(),
  ]);

  const sentPendingIds = new Set(sentPendingRequests.map((r) => r.toUser.toString()));
  const receivedPendingIds = new Set(receivedPendingRequests.map((r) => r.fromUser.toString()));

  const connectedIds = new Set();
  for (const r of acceptedRequests) {
    const otherId = r.fromUser.toString() === userId.toString() ? r.toUser.toString() : r.fromUser.toString();
    connectedIds.add(otherId);
  }

  for (const m of activeMatches) {
    const otherId = m.userA.toString() === userId.toString() ? m.userB.toString() : m.userA.toString();
    if (!sentPendingIds.has(otherId) && !receivedPendingIds.has(otherId)) {
      connectedIds.add(otherId);
    }
  }

  return bookmarks
    .filter((b) => b.bookmarkedUserId) // guard against a bookmarked user that was later deleted
    .map((b) => {
      const u = b.bookmarkedUserId;
      const uIdStr = u._id.toString();
      const isRequestSent = sentPendingIds.has(uIdStr);
      const hasReceivedRequest = !isRequestSent && receivedPendingIds.has(uIdStr);
      const isConnected = !isRequestSent && (connectedIds.has(uIdStr) || hasReceivedRequest);
      return {
        bookmarkId: b._id,
        bookmarkedAt: b.createdAt,
        user: {
          id: u._id,
          _id: u._id,
          name: u.name,
          age: u.age,
          gender: u.gender || 'Not specified',
          bio: u.bio || '',
          avatarUrl: u.avatarUrl || '',
          housingStatus: u.housingStatus,
          location: u.location?.displayName || (typeof u.location === 'string' ? u.location : 'Addis Ababa'),
          preferences: u.preferences || {},
          budgetMax: u.preferences?.budgetMax,
          budgetMin: u.preferences?.budgetMin,
          isConnected,
          isRequestSent,
          hasReceivedRequest,
        },
      };
    });
}

/**
 * DELETE /bookmarks/:bookmarkedUserId — FR-6.2: remove an entry.
 */
async function removeBookmark(userId, bookmarkedUserId) {
  if (!mongoose.Types.ObjectId.isValid(bookmarkedUserId)) {
    throw new BookmarksError('Invalid user id.', 422);
  }

  const result = await Bookmark.findOneAndDelete({ userId, bookmarkedUserId });
  if (!result) {
    throw new BookmarksError('Bookmark not found.', 404);
  }
  return result;
}

export { addBookmark, listBookmarks, removeBookmark, BookmarksError };