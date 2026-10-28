/**
 * Middleware: requireFullAccess & requireQuestionnaireCompleted
 * Enforces Dual-Gate Security (SRS FR-2.2, FR-3.3, Arch §3.3.2):
 *
 * - requireQuestionnaireCompleted:
 *   Ensures user completed the questionnaire. Unverified users can still browse
 *   candidates, view profiles, bookmarks, and search.
 *
 * - requireFullAccess:
 *   Requires questionnaire completion AND identity verification.
 *   Enforced strictly for messaging, chat, and meetup services.
 */

export async function requireQuestionnaireCompleted(request, reply) {
  const user = request.user;
  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  if (!user.questionnaireCompleted) {
    return reply.status(403).send({
      success: false,
      error: 'QUESTIONNAIRE_REQUIRED',
      message: 'You must complete the questionnaire before accessing this feature.',
    });
  }
}

export async function requireFullAccess(request, reply) {
  const user = request.user;
  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }

  if (!user.questionnaireCompleted) {
    return reply.status(403).send({
      success: false,
      error: 'QUESTIONNAIRE_REQUIRED',
      message: 'You must complete the questionnaire before accessing this feature.',
    });
  }

  if (user.verificationStatus !== 'verified') {
    return reply.status(403).send({
      success: false,
      error: 'VERIFICATION_REQUIRED',
      message: 'Your account must be identity verified before accessing messaging and meetup features.',
      verificationStatus: user.verificationStatus || 'unverified',
    });
  }
}
