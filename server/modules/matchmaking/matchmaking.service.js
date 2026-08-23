import { MatchRequest } from './matchrequest.model.js';
import { Match } from '../chat/matches.model.js';
import { Message } from '../chat/message.model.js';
import { User } from '../users/users.model.js';
import { getIO } from '../chat/chat.gateway.js';
import { enqueueNewMatchEmail } from '../notifications/notification.queue.js';
import { getCandidatePoolA, scoreCandidate } from './matchmaking.algorithm.js';

class MatchmakingError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * GET /matches/feed
 * Gated behind questionnaireCompleted + verificationStatus === 'verified'.
 */
async function getMatchFeed(user, { page = 1, pageSize = 20 } = {}) {
  if (!user.questionnaireCompleted) {
    throw new MatchmakingError('Complete the onboarding questionnaire first.', 403);
  }
  if (user.verificationStatus !== 'verified') {
    throw new MatchmakingError('Identity verification is required to view matches.', 403);
  }

  const candidates = await getCandidatePoolA(user);

  const scored = candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(user, candidate) }))
    .sort((a, b) => b.score - a.score);

  const start = (page - 1) * pageSize;
  const pageItems = scored.slice(start, start + pageSize);

  return {
    page,
    pageSize,
    totalCandidates: scored.length,
    matches: pageItems.map(({ candidate, score }) => ({
      id: candidate._id,
      name: candidate.name,
      age: candidate.age,
      bio: candidate.bio,
      avatarUrl: candidate.avatarUrl,
      housingStatus: candidate.housingStatus,
      location: candidate.location?.displayName,
      matchType: 'has_room',
      score,
      preferences: candidate.preferences,
      gender: candidate.gender
    })),
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
  
  if (fromUser.verificationStatus !== 'verified') {
    throw new MatchmakingError('Identity verification is required to send match requests.', 403);
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

  // 1. Find or create active Match connection between users
  let match = await Match.findOne({
    $or: [
      { userA: fromUser._id, userB: toUserId },
      { userA: toUserId, userB: fromUser._id },
    ],
  });

  if (!match) {
    match = await Match.create({
      userA: fromUser._id,
      userB: toUserId,
      status: 'active',
    });
  } else if (match.status === 'blocked') {
    throw new MatchmakingError('You cannot send a request to this user.', 403);
  }

  // 2. Track or update MatchRequest record
  let request = await MatchRequest.findOne({ fromUser: fromUser._id, toUser: toUserId });
  if (!request) {
    request = await MatchRequest.create({
      fromUser: fromUser._id,
      toUser: toUserId,
      status: 'pending',
      message: message || '',
    });
  }

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
  } catch (e) {
    // Socket.IO may be offline or initializing
  }

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

  return { request, match };
}

export { getMatchFeed, sendMatchRequest, respondToMatchRequest, MatchmakingError };