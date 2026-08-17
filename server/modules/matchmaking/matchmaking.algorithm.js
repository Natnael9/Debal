import User from '../users/users.model.js';

/**
 * Pool A: default cross-type candidate query (has_room <-> needs_room).
 * Per architecture doc §9.1, plus two additions the doc's snippet omits
 * but the SRS requires:
 *   - opposite housingStatus filter (FR-4.1)
 *   - verificationStatus: 'verified' filter (FR-2.2, FR-4.4)
 * alreadyInteracted (users already requested/matched, FR-4.4) can't be
 * filtered yet — the Match/Request models don't exist until Day 3
 * (feature/match-requests-endpoint). Left as an empty array for now,
 * with a TODO to wire it in once that module exists.
 */
async function getCandidatePoolA(user) {
  const oppositeStatus = user.housingStatus === 'has_room' ? 'needs_room' : 'has_room';

  // TODO (Day 3): populate from Match/Request collections once they exist.
  const alreadyInteracted = [];

  const candidates = await User.find({
    _id: { $nin: [...user.blockedUsers, ...alreadyInteracted, user._id] },
    housingStatus: oppositeStatus,
    questionnaireCompleted: true,
    verificationStatus: 'verified',
    suspended: false,
    'location.coordinates': {
      $nearSphere: {
        $geometry: user.location,
        $maxDistance: user.maxDistance * 1000, // km -> meters
      },
    },
    'preferences.budgetMin': { $lte: user.preferences.budgetMax },
    'preferences.budgetMax': { $gte: user.preferences.budgetMin },
  }).limit(200);

  return candidates;
}

/** Weighted scoring, per architecture doc §9.2. */
function scoreCandidate(user, candidate) {
  // Budget overlap % (20%)
  const overlapMin = Math.max(user.preferences.budgetMin, candidate.preferences.budgetMin);
  const overlapMax = Math.min(user.preferences.budgetMax, candidate.preferences.budgetMax);
  const overlapSize = Math.max(0, overlapMax - overlapMin);
  const rangeSize = Math.max(user.preferences.budgetMax - user.preferences.budgetMin, 1);
  const budgetScore = Math.min(1, overlapSize / rangeSize);

  // Location distance (25%)
  const distanceMeters = haversineDistanceMeters(
    user.location.coordinates,
    candidate.location.coordinates
  );
  const distanceKm = distanceMeters / 1000;
  const locationScore = Math.max(0, 1 - distanceKm / user.maxDistance);

  // Cleanliness match (20%)
  const cleanlinessDiff = Math.abs(user.preferences.cleanliness - candidate.preferences.cleanliness);
  const cleanlinessScore = 1 - cleanlinessDiff / 4;

  // Sleep compatibility (15%)
  let sleepScore = 0;
  if (user.preferences.sleepSchedule === candidate.preferences.sleepSchedule) {
    sleepScore = 1.0;
  } else if (
    user.preferences.sleepSchedule === 'flexible' ||
    candidate.preferences.sleepSchedule === 'flexible'
  ) {
    sleepScore = 0.5;
  }

  // Smoking / pets alignment (10% each)
  const smokingScore = user.preferences.smokingOk === candidate.preferences.smokingOk ? 1.0 : 0;
  const petsScore = user.preferences.petsOk === candidate.preferences.petsOk ? 1.0 : 0;

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

export { getCandidatePoolA, scoreCandidate };