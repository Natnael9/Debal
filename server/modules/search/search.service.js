import User from '../users/users.model.js';

class SearchError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * GET /search
 * Manual search/filter, independent of the algorithmic feed ranking (FR-5.1).
 * No scoring — filter + paginate only, per architecture doc §6.3.
 * Reuses the same eligibility rules as the match feed (FR-2.2, FR-3.3, FR-4.4).
 */
async function searchCandidates(user, filters = {}, { page = 1, pageSize = 20 } = {}) {
  if (!user.questionnaireCompleted) {
    throw new SearchError('Complete the onboarding questionnaire first.', 403);
  }
  if (user.verificationStatus !== 'verified') {
    throw new SearchError('Identity verification is required to search.', 403);
  }

  const oppositeStatus = user.housingStatus === 'has_room' ? 'needs_room' : 'has_room';

  const query = {
    _id: { $nin: [...(user.blockedUsers || []), user._id] },
    questionnaireCompleted: true,
    verificationStatus: { $in: ['verified', 'pending', 'unverified'] },
    suspended: false,
  };

  if (filters.status && filters.status !== 'any') {
    query.housingStatus = filters.status;
  } else if (!filters.status) {
    query.housingStatus = oppositeStatus;
  }

  if (filters.budgetMin != null || filters.budgetMax != null) {
    if (filters.budgetMax != null) {
      query['preferences.budgetMin'] = { $lte: filters.budgetMax };
    }
    if (filters.budgetMin != null) {
      query['preferences.budgetMax'] = { $gte: filters.budgetMin };
    }
  }

  if (filters.cleanliness != null) {
    query['preferences.cleanliness'] = filters.cleanliness;
  }
  if (filters.sleepSchedule) {
    query['preferences.sleepSchedule'] = filters.sleepSchedule;
  }
  if (filters.smokingOk != null) {
    query['preferences.smokingOk'] = filters.smokingOk;
  }
  if (filters.petsOk != null) {
    query['preferences.petsOk'] = filters.petsOk;
  }

  if (filters.location && user.location) {
    query.location = {
      $nearSphere: {
        $geometry: user.location,
        $maxDistance: (filters.maxDistance || user.maxDistance) * 1000,
      },
    };
  }

  const total = await User.countDocuments(query);
  const results = await User.find(query)
    .select('name age gender bio avatarUrl housingStatus location preferences verificationStatus')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    page,
    pageSize,
    totalCandidates: total,
    results: results.map((candidate) => ({
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
      matchType: 'has_room', // Team-up (Pool B) filtering is a stretch goal, not yet implemented
    })),
  };
}

export { searchCandidates, SearchError };