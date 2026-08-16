import User from './users.model.js';
import { calculateProfileCompletion } from './completion.util.js';

class UsersError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * POST /onboarding/questionnaire
 * Accepts the full questionnaire in one submission, maps it onto the
 * users.model.js shape, marks questionnaireCompleted, and recomputes
 * profileCompletionPercent (FR-3.1, FR-3.5).
 */
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
  return user;
}

export { submitQuestionnaire, UsersError };