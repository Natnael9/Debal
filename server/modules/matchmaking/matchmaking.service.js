import { MatchRequest } from './matchrequest.model.js';
import { Match } from '../chat/matches.model.js';
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
 * Team-up Pool B is a stretch goal — not included yet, moves to Day 3.
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
      matchType: 'has_room', // Pool A is always cross-type; Pool B (team-up) is a stretch goal
      score,
    })),
  };
}

/**
 * POST /matches/request/:userId
 * Send a chat request to a candidate (FR-7.1, FR-7.2, FR-7.6).
 */
async function sendMatchRequest(fromUser, toUserId, message) {
  if (fromUser._id.toString() === toUserId.toString()) {
    throw new MatchmakingError('You cannot send a request to yourself.', 400);
  }

  if (message && message.length > 300) {
    throw new MatchmakingError('Message must be 300 characters or fewer.', 400);
  }

  const alreadyMatched = await Match.findOne({
    $or: [
      { userA: fromUser._id, userB: toUserId },
      { userA: toUserId, userB: fromUser._id },
    ],

  });
  
  if (alreadyMatched) {
    throw new MatchmakingError('You are already matched with this user.', 409);
  }

  const existing = await MatchRequest.findOne({ fromUser: fromUser._id, toUser: toUserId });
  if (existing) {
    throw new MatchmakingError('You already have a pending request to this user.', 409);
  }

  const request = await MatchRequest.create({
    fromUser: fromUser._id,
    toUser: toUserId,
    message,
  });

  return request;
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

  const match = await Match.create({
    userA: request.fromUser,
    userB: request.toUser,
  });

  return { request, match };
}
export { getMatchFeed, sendMatchRequest, respondToMatchRequest, MatchmakingError };