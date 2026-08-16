import { submitVerification, confirmOtp } from './verification.service.js';

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