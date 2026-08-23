/**
 * Middleware: requireFullAccess
 * Enforces Dual-Gate Security (SRS FR-2.2, FR-3.3, Arch §3.3.2):
 * Requires that request.user has completed the questionnaire AND is ID verified.
 */
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
      message: 'Your account must be identity verified before accessing this feature.',
      verificationStatus: user.verificationStatus || 'unverified',
    });
  }
}
