import { submitVerification } from './verification.service.js';

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
        message: 'Identity matched. Proceed to email OTP confirmation.',
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