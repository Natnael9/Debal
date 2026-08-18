import {
  submitVerification,
  confirmOtp,
  listVerifications,
  getVerificationDetail,
  decideVerification,
} from './verification.service.js';
import { logAdminRead } from '../admin/admin-action.service.js';

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

// ---- Admin edge-case queue (FR-2.7, FR-12.2, §13.3) ----

/**
 * GET /api/v1/admin/verifications?status=pending_review&page=1&limit=20
 *
 * Query params:
 *   status  — one of: pending_review (default), matched, no_match
 *   page    — 1-based page index (default: 1)
 *   limit   — records per page, max 100 (default: 20)
 *
 * Access: admin-role JWT (§12.2); every invocation is audit-logged (§13.3).
 */
export async function listPendingReviewHandler(request, reply) {
  const { status = 'pending_review', page = 1, limit = 20 } = request.query;

  try {
    const result = await listVerifications({
      status,
      page,
      limit,
      adminId: request.admin.sub, // from requireAdmin middleware — used for §13.3 audit log
    });
    return reply.send({ success: true, data: result });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

/**
 * GET /api/v1/admin/verifications/:id
 *
 * Returns decrypted identity fields (name, dateOfBirth) alongside all
 * verification request metadata. Access: admin-role JWT only (§12.2).
 * Every access is audit-logged (§13.3).
 */
export async function getVerificationDetailHandler(request, reply) {
  try {
    const detail = await getVerificationDetail(request.params.id);

    // §13.3 — log every admin read of decrypted identity data
    await logAdminRead({
      adminId: request.admin.sub,
      action: 'view_verification',
      targetUserId: detail.userId,
      metadata: { verificationRequestId: request.params.id },
    });

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