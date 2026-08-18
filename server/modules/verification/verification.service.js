import { User } from '../users/users.model.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';
import { VerificationRequest } from './verification.model.js';
import { hashIdNumber, encryptIdentity, decryptIdentity } from './encryption.util.js';
import { generateOtp, hashOtp, isOtpExpired } from './otp.util.js';
import { sendVerificationOtpEmail } from '../notifications/email.util.js';
import { logAdminAction } from '../admin/admin-action.service.js';

function sameDay(dateA, dateB) {
  return new Date(dateA).toDateString() === new Date(dateB).toDateString();
}

export async function submitVerification(userId, { idNumber, name, dateOfBirth }) {
  const idNumberHash = hashIdNumber(idNumber);

  const existing = await User.findOne({ idNumberHash });
  if (existing && existing._id.toString() !== userId.toString()) {
    const err = new Error('This ID number is already associated with another account');
    err.code = 'ID_ALREADY_USED';
    throw err;
  }

  const record = await FaydaSimulatedRecord.findOne({ idNumber });
  const identityEncrypted = encryptIdentity(JSON.stringify({ name, dateOfBirth }));

  let result;
  let rejectionReason;

  if (record && record.name.toLowerCase() === name.toLowerCase() && sameDay(record.dateOfBirth, dateOfBirth)) {
    result = 'matched';
  } else {
    result = 'no_match';
    rejectionReason = record
      ? 'Name or date of birth does not match our records for this ID number'
      : 'ID number not found';
  }

  const verificationRequest = await VerificationRequest.create({
    userId,
    idNumberHash,
    identityEncrypted,
    result,
    rejectionReason,
    submittedAt: new Date(),
  });

  if (result === 'matched') {
    await User.findByIdAndUpdate(userId, { idNumberHash, verificationStatus: 'pending' });

    // Generate, hash, store, and email the OTP
    const { otp, expiresAt } = generateOtp();
    verificationRequest.otpHash = hashOtp(otp);
    verificationRequest.otpExpiresAt = expiresAt;
    await verificationRequest.save();

    const user = await User.findById(userId);
    await sendVerificationOtpEmail(user.email, otp);
  } else {
    await User.findByIdAndUpdate(userId, { verificationStatus: 'rejected' });
  }

  return { result, rejectionReason, verificationRequestId: verificationRequest._id };
}

export async function confirmOtp(userId, otp) {
  const verificationRequest = await VerificationRequest.findOne({
    userId,
    result: 'matched',
    otpVerifiedAt: { $exists: false },
  }).sort({ submittedAt: -1 });

  if (!verificationRequest) {
    const err = new Error('No pending OTP confirmation found for this user');
    err.code = 'NO_PENDING_VERIFICATION';
    throw err;
  }

  if (isOtpExpired(verificationRequest.otpExpiresAt)) {
    const err = new Error('OTP has expired. Please resubmit verification.');
    err.code = 'OTP_EXPIRED';
    throw err;
  }

  if (hashOtp(otp) !== verificationRequest.otpHash) {
    const err = new Error('Incorrect OTP');
    err.code = 'OTP_INCORRECT';
    throw err;
  }

  verificationRequest.otpVerifiedAt = new Date();
  verificationRequest.resolvedAt = new Date();
  await verificationRequest.save();

  await User.findByIdAndUpdate(userId, {
    verificationStatus: 'verified',
    verifiedAt: new Date(),
  });

  return { verified: true };
}


export async function listPendingReview() {
  return VerificationRequest.find({ result: 'pending_review' }).sort({ submittedAt: 1 });
}

export async function getVerificationDetail(verificationRequestId) {
  const verificationRequest = await VerificationRequest.findById(verificationRequestId);
  if (!verificationRequest) {
    const err = new Error('Verification request not found');
    err.code = 'VERIFICATION_NOT_FOUND';
    throw err;
  }

  const decrypted = decryptIdentity(verificationRequest.identityEncrypted);
  const { name, dateOfBirth } = JSON.parse(decrypted);

  const obj = verificationRequest.toObject();
  delete obj.identityEncrypted; // never send ciphertext to the client

  return { ...obj, identity: { name, dateOfBirth } }; // decrypted — this endpoint is requireAdmin-gated
}

export async function decideVerification(verificationRequestId, adminId, { decision, notes }) {
  const verificationRequest = await VerificationRequest.findById(verificationRequestId);
  if (!verificationRequest) {
    const err = new Error('Verification request not found');
    err.code = 'VERIFICATION_NOT_FOUND';
    throw err;
  }

  verificationRequest.reviewedBy = adminId;
  verificationRequest.reviewNotes = notes;
  verificationRequest.resolvedAt = new Date();

  if (decision === 'approve') {
    verificationRequest.result = 'matched';
    await User.findByIdAndUpdate(verificationRequest.userId, {
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    });
  } else {
    verificationRequest.result = 'no_match';
    verificationRequest.rejectionReason = notes || 'Rejected by admin review';
    await User.findByIdAndUpdate(verificationRequest.userId, { verificationStatus: 'rejected' });
  }

  await verificationRequest.save();

  await logAdminAction({
    adminId,
    action: decision === 'approve' ? 'approve_verification' : 'reject_verification',
    targetUserId: verificationRequest.userId,
    notes,
  });

  return verificationRequest;
}