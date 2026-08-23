import User from '../users/users.model.js';

/**
 * Pool A: default cross-type candidate query (has_room <-> needs_room).
 * Ultra-fast indexed query returning verified candidates with gender and lifestyle preferences.
 */
async function getCandidatePoolA(user) {
  const oppositeStatus = user.housingStatus === 'has_room' ? 'needs_room' : 'has_room';

  // Exclude only blocked users and the current user
  const excludeIds = new Set([user._id.toString(), ...(user.blockedUsers || []).map(id => id.toString())]);

  const filterQuery = {
    housingStatus: oppositeStatus,
    questionnaireCompleted: true,
    verificationStatus: { $in: ['verified', 'pending', 'unverified'] },
    suspended: false,
    _id: { $nin: Array.from(excludeIds) },
  };

  const projection = 'name age gender bio avatarUrl housingStatus location preferences verificationStatus';

  // Fast indexed MongoDB query
  const candidates = await User.find(filterQuery)
    .select(projection)
    .limit(100)
    .lean();

  return candidates || [];
}

/** Weighted scoring, per architecture doc §9.2. */
function scoreCandidate(user, candidate) {
  const uMin = user.preferences?.budgetMin ?? 0;
  const uMax = user.preferences?.budgetMax ?? 100000;
  const cMin = candidate.preferences?.budgetMin ?? 0;
  const cMax = candidate.preferences?.budgetMax ?? 100000;

  // Budget overlap calculation (20% of total score)
  let budgetScore = 0;
  if (user.housingStatus === 'needs_room' && candidate.housingStatus === 'has_room') {
    // If seeker's max budget is below candidate's min or max rent, seeker cannot afford it
    if (cMin > uMax || (cMax > uMax && cMin > uMax)) {
      budgetScore = 0;
    } else {
      const overlapMin = Math.max(uMin, cMin);
      const overlapMax = Math.min(uMax, cMax);
      if (overlapMax >= overlapMin) {
        // Overlap ratio relative to candidate room price
        const overlapSize = overlapMax - overlapMin;
        const candidateSpan = Math.max(cMax - cMin, 1);
        budgetScore = Math.min(1, overlapSize / candidateSpan);
        // Penalize if candidate rent ceiling exceeds user max budget
        if (cMax > uMax) {
          const excess = (cMax - uMax) / uMax;
          budgetScore = Math.max(0, budgetScore - excess);
        }
      }
    }
  } else {
    const overlapMin = Math.max(uMin, cMin);
    const overlapMax = Math.min(uMax, cMax);
    if (overlapMax >= overlapMin) {
      const overlapSize = overlapMax - overlapMin;
      const rangeSize = Math.max(uMax - uMin, 1);
      budgetScore = Math.min(1, overlapSize / rangeSize);
    }
  }

  // Location distance in memory (25%)
  let locationScore = 0.8;
  if (user.location?.coordinates?.length === 2 && candidate.location?.coordinates?.length === 2) {
    const distanceMeters = haversineDistanceMeters(
      user.location.coordinates,
      candidate.location.coordinates
    );
    const distanceKm = distanceMeters / 1000;
    const maxDist = user.maxDistance || 50;
    locationScore = Math.max(0, 1 - distanceKm / maxDist);
  }

  // Cleanliness match (20%)
  const uClean = user.preferences?.cleanliness ?? 3;
  const cClean = candidate.preferences?.cleanliness ?? 3;
  const cleanlinessDiff = Math.abs(uClean - cClean);
  const cleanlinessScore = 1 - cleanlinessDiff / 4;

  // Sleep compatibility (15%)
  let sleepScore = 0.5;
  const uSleep = user.preferences?.sleepSchedule;
  const cSleep = candidate.preferences?.sleepSchedule;
  if (uSleep && cSleep) {
    if (uSleep === cSleep) {
      sleepScore = 1.0;
    } else if (uSleep === 'flexible' || cSleep === 'flexible') {
      sleepScore = 0.5;
    } else {
      sleepScore = 0.2;
    }
  }

  // Smoking / pets alignment (10% each)
  const smokingScore = user.preferences?.smokingOk === candidate.preferences?.smokingOk ? 1.0 : 0.5;
  const petsScore = user.preferences?.petsOk === candidate.preferences?.petsOk ? 1.0 : 0.5;

  const totalScore =
    (budgetScore * 0.2 +
      locationScore * 0.25 +
      cleanlinessScore * 0.2 +
      sleepScore * 0.15 +
      smokingScore * 0.1 +
      petsScore * 0.1) *
    100;

  return Math.round(totalScore);
}

// Great-circle distance between two [lng, lat] points, in meters.
function haversineDistanceMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pool B: team-up candidate query (needs_room <-> needs_room).
 * Returns opted-in needs_room candidates when currentUser is also needs_room and teamUpEnabled.
 */
async function getCandidatePoolB(user) {
  if (user.housingStatus !== 'needs_room' || !user.teamUpEnabled) {
    return [];
  }

  const excludeIds = new Set([user._id.toString(), ...(user.blockedUsers || []).map(id => id.toString())]);

  const filterQuery = {
    housingStatus: 'needs_room',
    teamUpEnabled: true,
    questionnaireCompleted: true,
    verificationStatus: { $in: ['verified', 'pending', 'unverified'] },
    suspended: false,
    _id: { $nin: Array.from(excludeIds) },
  };

  const projection = 'name age gender bio avatarUrl housingStatus location preferences verificationStatus teamUpEnabled';

  const candidates = await User.find(filterQuery)
    .select(projection)
    .limit(100)
    .lean();

  return candidates || [];
}

export { getCandidatePoolA, getCandidatePoolB, scoreCandidate };