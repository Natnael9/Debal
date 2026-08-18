// FR-3.5: profile-completion percentage.
// NOTE: the exact weighting isn't specified anywhere in the SRS or arch doc —
// this is a reasonable judgment call (required fields = 70%, optional
// extras = 30%). Flag to the team if a different split is wanted.

const REQUIRED_WEIGHT = 70;
const OPTIONAL_WEIGHT = 30;

export function calculateProfileCompletion(user) {
  const requiredChecks = [
    Boolean(user.housingStatus),
    typeof user.age === 'number',
    Boolean(user.gender),
    user.preferences?.budgetMin != null && user.preferences?.budgetMax != null,
    Array.isArray(user.location?.coordinates) && user.location.coordinates.length === 2,
    typeof user.maxDistance === 'number',
    user.preferences?.cleanliness != null,
    Boolean(user.preferences?.sleepSchedule),
    typeof user.preferences?.smokingOk === 'boolean',
    typeof user.preferences?.petsOk === 'boolean',
  ];
  const requiredScore =
    requiredChecks.filter(Boolean).length / requiredChecks.length;

  const optionalChecks = [
    Boolean(user.bio && user.bio.trim().length >= 20), // a "real" bio, not a couple words
    Boolean(user.avatarUrl), // profile photo present
  ];
  const optionalScore =
    optionalChecks.filter(Boolean).length / optionalChecks.length;

  const percent = Math.round(
    requiredScore * REQUIRED_WEIGHT + optionalScore * OPTIONAL_WEIGHT
  );
  return Math.min(100, Math.max(0, percent));
}