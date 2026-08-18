import {
  submitVerification,
  confirmOtp,
  listPendingReview,
  getVerificationDetail,
  decideVerification,
} from './verification.service.js';

// ---- User-facing (self-service, automatic) ----

export async function submitVerificationHandler(request, reply) {
  const { idNumber, name, dateOfBirth } = request.body;

  if (!idNumber || !name || !dateOfBirth) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'idNumber, name, and dateOfBirth are required',
    });
  }

  try {
    const outcome = await submitVerification(request.user._id, { idNumber, name, dateOfBirth });

    if (outcome.result === 'matched') {
      return reply.send({
        success: true,
        data: { result: 'matched', nextStep: 'confirm-otp' },
        message: 'Identity matched. Check your email for a verification code.',
      });
    }

    return reply.status(422).send({
      success: false,
      error: 'VERIFICATION_NO_MATCH',
      message: outcome.rejectionReason,
    });
  } catch (err) {
    if (err.code === 'ID_ALREADY_USED') {
      return reply.status(409).send({ success: false, error: err.code, message: err.message });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

export async function confirmOtpHandler(request, reply) {
  const { otp } = request.body;

  if (!otp) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_OTP',
      message: 'otp is required',
    });
  }

  try {
    await confirmOtp(request.user._id, otp);
    return reply.send({
      success: true,
      message: 'Identity verified successfully.',
    });
  } catch (err) {
    const knownErrors = ['NO_PENDING_VERIFICATION', 'OTP_EXPIRED', 'OTP_INCORRECT'];
    if (knownErrors.includes(err.code)) {
      return reply.status(400).send({ success: false, error: err.code, message: err.message });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

// ---- Admin edge-case queue (FR-2.7, FR-12.2) ----

export async function listPendingReviewHandler(request, reply) {
  const requests = await listPendingReview();
  return reply.send({ success: true, data: { requests } });
}

export async function getVerificationDetailHandler(request, reply) {
  try {
    const detail = await getVerificationDetail(request.params.id);
    return reply.send({ success: true, data: detail });
  } catch (err) {
    if (err.code === 'VERIFICATION_NOT_FOUND') {
      return reply.status(404).send({ success: false, error: err.code });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

export async function decideVerificationHandler(request, reply) {
  const { decision, notes } = request.body;

  if (!['approve', 'reject'].includes(decision)) {
    return reply.status(400).send({
      success: false,
      error: 'INVALID_DECISION',
      message: 'decision must be "approve" or "reject"',
    });
  }

  try {
    const verificationRequest = await decideVerification(
      request.params.id,
      request.admin.sub, // admin ID comes from the JWT payload, not a DB fetch
      { decision, notes }
    );
    return reply.send({ success: true, data: { verificationRequest } });
  } catch (err) {
    if (err.code === 'VERIFICATION_NOT_FOUND') {
      return reply.status(404).send({ success: false, error: err.code });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}