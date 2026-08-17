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

export { getMatchFeed, MatchmakingError };