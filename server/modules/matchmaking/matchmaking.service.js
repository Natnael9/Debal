import { MatchRequest } from './matchrequest.model.js';
import { Match } from '../chat/matches.model.js';
import { Message } from '../chat/message.model.js';
import { User } from '../users/users.model.js';
import Bookmark from '../bookmarks/bookmarks.model.js';
import { getIO } from '../chat/chat.gateway.js';
import { enqueueNewMatchEmail } from '../notifications/notification.queue.js';
import { getCandidatePoolA, getCandidatePoolB, scoreCandidate } from './matchmaking.algorithm.js';
import { getRedisClient, isRedisHealthy } from '../../config/redis.js';

class MatchmakingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Invalidate cached feed for a user (SRS FR-4.5, Arch §9.3)
 */
export async function invalidateMatchFeedCache(userId) {
  if (!userId) return;
  try {
    const healthy = await isRedisHealthy();
    if (healthy) {
      const redis = getRedisClient();
      await redis.del(`match_feed:${userId.toString()}`);
    }
  } catch (err) {
    // Non-blocking cache error fallback
  }
}

/**
 * GET /matches/feed
 * Dual-pool match feed (Pool A: default cross-type, Pool B: team-up opt-in)
 * Gated behind questionnaireCompleted + verificationStatus === 'verified'.
 */
async function getMatchFeed(user, { page = 1, pageSize = 20 } = {}) {
  if (!user.questionnaireCompleted) {
    throw new MatchmakingError('Complete the onboarding questionnaire first.', 403);
  }

  const cacheKey = `match_feed:${user._id.toString()}`;
  let allMatches = null;

  // Try fetching from Redis cache
  try {
    const healthy = await isRedisHealthy();
    if (healthy) {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached) {
        allMatches = JSON.parse(cached);
      }
    }
  } catch (err) {
    // Cache read fallback
  }

  if (!allMatches) {
    // Fetch Pool A and Pool B in parallel for maximum performance
    const [poolA, poolB] = await Promise.all([
      getCandidatePoolA(user),
      getCandidatePoolB(user),
    ]);

    const poolACandidates = poolA.map(c => ({ candidate: c, matchType: 'has_room' }));
    const poolBCandidates = poolB.map(c => ({ candidate: c, matchType: 'team_up' }));

    // Merge candidates, preventing duplicates
    const seenIds = new Set();
    const merged = [];

    for (const item of [...poolACandidates, ...poolBCandidates]) {
      const cId = item.candidate._id.toString();
      if (!seenIds.has(cId)) {
        seenIds.add(cId);
        merged.push(item);
      }
    }

    const scored = merged
      .map(({ candidate, matchType }) => ({
        candidate,
        matchType,
        score: scoreCandidate(user, candidate),
      }))
      .sort((a, b) => b.score - a.score);

    allMatches = scored.map(({ candidate, matchType, score }) => ({
      id: candidate._id,
      name: candidate.name,
      age: candidate.age,
      gender: candidate.gender || 'Not specified',
      bio: candidate.bio || '',
      avatarUrl: candidate.avatarUrl || '',
      housingStatus: candidate.housingStatus,
      location: candidate.location?.displayName || (typeof candidate.location === 'string' ? candidate.location : 'Addis Ababa'),
      preferences: candidate.preferences || {},
      budgetMax: candidate.preferences?.budgetMax,
      budgetMin: candidate.preferences?.budgetMin,
      matchType,
      score,
      preferences: candidate.preferences,
      gender: candidate.gender
    }));

    // Cache merged matches in Redis for 1 hour (3600 seconds)
    try {
      const healthy = await isRedisHealthy();
      if (healthy) {
        const redis = getRedisClient();
        await redis.setex(cacheKey, 3600, JSON.stringify(allMatches));
      }
    } catch (err) {
      // Cache write fallback
    }
  }

  const start = (page - 1) * pageSize;
  const rawPageItems = allMatches.slice(start, start + pageSize);

  // Dynamically decorate candidates with real-time match request, connection, and bookmark status
  const [sentPendingRequests, receivedPendingRequests, acceptedRequests, activeMatches, userBookmarks] = await Promise.all([
    MatchRequest.find({
      fromUser: user._id,
      status: 'pending',
    }).select('toUser').lean(),
    MatchRequest.find({
      toUser: user._id,
      status: 'pending',
    }).select('fromUser').lean(),
    MatchRequest.find({
      $or: [{ fromUser: user._id }, { toUser: user._id }],
      status: 'accepted',
    }).select('fromUser toUser').lean(),
    Match.find({
      $or: [{ userA: user._id }, { userB: user._id }],
      status: 'active',
    }).select('userA userB').lean(),
    Bookmark.find({ userId: user._id }).select('bookmarkedUserId').lean(),
  ]);

  const sentPendingIds = new Set(sentPendingRequests.map((r) => r.toUser.toString()));
  const receivedPendingIds = new Set(receivedPendingRequests.map((r) => r.fromUser.toString()));

  const connectedIds = new Set();

  for (const r of acceptedRequests) {
    const otherId = r.fromUser.toString() === user._id.toString() ? r.toUser.toString() : r.fromUser.toString();
    connectedIds.add(otherId);
  }

  for (const m of activeMatches) {
    const otherId = m.userA.toString() === user._id.toString() ? m.userB.toString() : m.userA.toString();
    connectedIds.add(otherId);
  }

  const bookmarkedIds = new Set(userBookmarks.map((b) => b.bookmarkedUserId.toString()));

  const pageItems = rawPageItems.map((item) => {
    const itemIdStr = (item.id || item._id).toString();
    const isConnected = connectedIds.has(itemIdStr);
    const isRequestSent = !isConnected && sentPendingIds.has(itemIdStr);
    return {
      ...item,
      isConnected,
      isRequestSent,
      hasReceivedRequest: isConnected,
      isBookmarked: bookmarkedIds.has(itemIdStr),
    };
  });

  return {
    page,
    pageSize,
    totalCandidates: allMatches.length,
    matches: pageItems,
  };
}

/**
 * POST /matches/request/:userId
 * Send a chat request to a candidate (FR-7.1, FR-7.2, FR-7.6).
 * Creates active Match, saves initial Message, and broadcasts real-time Socket.IO notification.
 */
async function sendMatchRequest(fromUser, toUserId, message) {
  if (!fromUser.questionnaireCompleted) {
    throw new MatchmakingError('Complete the onboarding questionnaire first.', 403);
  }

  if (fromUser._id.toString() === toUserId.toString()) {
    throw new MatchmakingError('You cannot send a request to yourself.', 400);
  }

  if (message && message.length > 300) {
    throw new MatchmakingError('Message must be 300 characters or fewer.', 400);
  }

  const targetUser = await User.findById(toUserId).lean();
  if (!targetUser) {
    throw new MatchmakingError('Target candidate not found.', 404);
  }

  // 1. Prevent duplicate requests: check if request already exists
  const existingRequest = await MatchRequest.findOne({
    fromUser: fromUser._id,
    toUser: toUserId,
    status: { $in: ['pending', 'accepted'] },
  });

  if (existingRequest) {
    throw new MatchmakingError('You have already sent a connection request to this candidate.', 400);
  }

  const incomingRequest = await MatchRequest.findOne({
    fromUser: toUserId,
    toUser: fromUser._id,
    status: { $in: ['pending', 'accepted'] },
  });

  if (incomingRequest) {
    throw new MatchmakingError('This candidate has already sent you a connection request. Check your messages!', 400);
  }

  // 2. Find or create active Match connection between users
  let match = await Match.findOne({
    $or: [
      { userA: fromUser._id, userB: toUserId },
      { userA: toUserId, userB: fromUser._id },
    ],
  });

  if (match && match.status === 'blocked') {
    throw new MatchmakingError('You cannot send a request to this user.', 403);
  }

  if (!match) {
    match = await Match.create({
      userA: fromUser._id,
      userB: toUserId,
      status: 'active',
    });
  }

  // 3. Create MatchRequest record
  const request = await MatchRequest.create({
    fromUser: fromUser._id,
    toUser: toUserId,
    status: 'pending',
    message: message || '',
  });

  // 3. Save initial message into conversation so recipient immediately receives it in Chat
  const initialContent = (message && message.trim())
    ? message.trim()
    : `Hi ${targetUser.name || ''}, I sent you a roommate connection request!`.trim();

  const savedMessage = await Message.create({
    matchId: match._id,
    senderId: fromUser._id,
    content: initialContent,
  });

  // 4. Real-time Socket.IO notification to recipient and sender
  try {
    const io = getIO();
    const payloadData = { matchId: match._id.toString(), message: savedMessage };
    io.to(`user:${toUserId.toString()}`).emit('chat:new_message', payloadData);
    io.to(`user:${fromUser._id.toString()}`).emit('chat:new_message', payloadData);
    io.to(`match:${match._id.toString()}`).emit('chat:new_message', payloadData);

    // Live pop-out notification for connection request
    const notificationPayload = {
      type: 'chat_request',
      title: 'New Roommate Request',
      message: `${fromUser.name} sent you a connection request!`,
      sender: {
        id: fromUser._id,
        name: fromUser.name,
        avatarUrl: fromUser.avatarUrl,
      },
      matchId: match._id.toString(),
      requestId: request._id.toString(),
      link: `/app/messages?matchId=${match._id.toString()}`,
    };

    io.to(`user:${toUserId.toString()}`).emit('notification:new', notificationPayload);
    io.to(`user:${toUserId.toString()}`).emit('match:request', notificationPayload);

    // Also publish to Redis if available
    const healthy = await isRedisHealthy();
    if (healthy) {
      const redis = getRedisClient();
      await redis.publish(
        `user:${toUserId.toString()}`,
        JSON.stringify({ event: 'notification:new', data: notificationPayload })
      );
    }
  } catch (e) {
    // Socket.IO may be offline or initializing
  }

  // Invalidate feed cache for both users
  await Promise.all([
    invalidateMatchFeedCache(fromUser._id),
    invalidateMatchFeedCache(toUserId),
  ]);

  return { request, match, message: savedMessage };
}

/**
 * POST /matches/respond/:requestId
 * Accept or decline a chat request (FR-7.3, FR-7.4, FR-7.5).
 */
async function respondToMatchRequest(currentUser, requestId, accept) {
  const request = await MatchRequest.findById(requestId);

  if (!request) {
    throw new MatchmakingError('Request not found.', 404);
  }

  if (request.toUser.toString() !== currentUser._id.toString()) {
    throw new MatchmakingError('You are not the recipient of this request.', 403);
  }

  if (request.status !== 'pending') {
    throw new MatchmakingError('This request has already been responded to.', 409);
  }

  request.status = accept ? 'accepted' : 'rejected';
  await request.save();

  if (!accept) {
    return { request, match: null };
  }

  let match = await Match.findOne({
    $or: [
      { userA: request.fromUser, userB: request.toUser },
      { userA: request.toUser, userB: request.fromUser },
    ],
  });

  if (!match) {
    match = await Match.create({
      userA: request.fromUser,
      userB: request.toUser,
      status: 'active',
    });
  }

  // Notify original requester that request was accepted
  await enqueueNewMatchEmail({ userId: request.fromUser, matchId: match._id });

  // Real-time Socket.IO notification to requester
  try {
    const io = getIO();
    const acceptedPayload = {
      type: 'request_accepted',
      title: 'Request Accepted!',
      message: `${currentUser.name} accepted your roommate connection request!`,
      user: {
        id: currentUser._id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      matchId: match._id.toString(),
      link: `/app/messages?matchId=${match._id.toString()}`,
    };

    io.to(`user:${request.fromUser.toString()}`).emit('notification:new', acceptedPayload);
    io.to(`user:${request.fromUser.toString()}`).emit('match:accepted', acceptedPayload);

    // Also publish to Redis if available
    const healthy = await isRedisHealthy();
    if (healthy) {
      const redis = getRedisClient();
      await redis.publish(
        `user:${request.fromUser.toString()}`,
        JSON.stringify({ event: 'notification:new', data: acceptedPayload })
      );
    }
  } catch (e) {
    // Socket.IO may be offline or initializing
  }

  // Invalidate feed cache for both users
  await Promise.all([
    invalidateMatchFeedCache(request.fromUser),
    invalidateMatchFeedCache(request.toUser),
  ]);

  return { request, match };
}

export { getMatchFeed, sendMatchRequest, respondToMatchRequest, MatchmakingError };