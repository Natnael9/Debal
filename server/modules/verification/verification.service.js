import { User } from '../users/users.model.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';
import { VerificationRequest } from './verification.model.js';
import { hashIdNumber, encryptIdentity, decryptIdentity } from './encryption.util.js';
import { generateOtp, hashOtp, isOtpExpired } from './otp.util.js';
import { sendVerificationOtpEmail, sendEmail } from '../notifications/email.util.js';
import { enqueueVerificationResultEmail } from '../notifications/notification.queue.js';
import { logAdminAction, logAdminRead } from '../admin/admin-action.service.js';

async function sendResultEmail(params) {
  try {
    await enqueueVerificationResultEmail(params);
  } catch (err) {
    console.warn('[verification] Queue fallback, sending direct email:', err.message);
    const user = await User.findById(params.userId);
    if (user && user.email) {
      const text = params.verified
        ? `Hi ${user.name}, your identity has been verified! You now have full access to the match feed.`
        : `Hi ${user.name}, we couldn't verify your identity${params.reason ? `: ${params.reason}` : '.'} You can correct your details and resubmit.`;
      await sendEmail({
        to: user.email,
        subject: params.verified ? "You're verified on Debal!" : 'Debal verification update',
        text,
      });
    }
  }
}

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

  let record = await FaydaSimulatedRecord.findOne({ idNumber });
  if (!record) {
    try {
      record = await FaydaSimulatedRecord.create({ idNumber, name, dateOfBirth });
    } catch (e) {
      record = await FaydaSimulatedRecord.findOne({ idNumber });
    }
  }
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
    await sendResultEmail({ userId, verified: false, reason: rejectionReason });
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

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    },
    { new: true }
  ).select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires');

  await sendResultEmail({ userId, verified: true });

  return updatedUser;
}

export async function resendOtp(userId) {
  const verificationRequest = await VerificationRequest.findOne({
    userId,
    result: 'matched',
    otpVerifiedAt: { $exists: false },
  }).sort({ submittedAt: -1 });

  if (!verificationRequest) {
    const err = new Error('No pending verification found. Please submit your Fayda ID details first.');
    err.code = 'NO_PENDING_VERIFICATION';
    throw err;
  }

  const { otp, expiresAt } = generateOtp();
  verificationRequest.otpHash = hashOtp(otp);
  verificationRequest.otpExpiresAt = expiresAt;
  await verificationRequest.save();

  const user = await User.findById(userId);
  if (!user || !user.email) {
    const err = new Error('User email not found.');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  await sendVerificationOtpEmail(user.email, otp);

  return { message: 'Verification code resent successfully.' };
}


// ---------------------------------------------------------------------------
// Admin queue (FR-2.7, FR-12.2, §13.3)
// ---------------------------------------------------------------------------

const VALID_STATUSES = ['matched', 'no_match', 'pending_review'];
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/**
 * List verification requests filtered by status.
 *
 * @param {object} opts
 * @param {string}  [opts.status='pending_review'] - result field filter
 * @param {number}  [opts.page=1]                  - 1-based page index
 * @param {number}  [opts.limit=20]                - records per page (max 100)
 * @param {string}  opts.adminId                   - JWT sub of the requesting admin (§13.3 audit)
 */
export async function listVerifications({ status = 'pending_review', page = 1, limit = DEFAULT_PAGE_SIZE, adminId } = {}) {
  const resolvedStatus = VALID_STATUSES.includes(status) ? status : 'pending_review';
  const resolvedLimit  = Math.min(Math.max(1, Number(limit)), MAX_PAGE_SIZE);
  const resolvedPage   = Math.max(1, Number(page));
  const skip           = (resolvedPage - 1) * resolvedLimit;

  const [requests, total] = await Promise.all([
    VerificationRequest
      .find({ result: resolvedStatus })
      .sort({ submittedAt: 1 })
      .skip(skip)
      .limit(resolvedLimit)
      .lean(),
    VerificationRequest.countDocuments({ result: resolvedStatus }),
  ]);

  // §13.3 — audit every admin access to the verification queue
  await logAdminRead({
    adminId,
    action: 'list_verifications',
    metadata: { status: resolvedStatus, page: resolvedPage, limit: resolvedLimit, resultCount: requests.length },
  });

  return {
    requests,
    pagination: {
      total,
      page: resolvedPage,
      limit: resolvedLimit,
      totalPages: Math.ceil(total / resolvedLimit),
    },
  };
}

/**
 * Fetch a single verification request and return the decrypted identity.
 * §13.3 — this is audit-logged at the *controller* layer so the adminId from
 * the JWT is always available without threading it through every service call.
 */
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

  return { ...obj, identity: { name, dateOfBirth } }; // decrypted — requireAdmin-gated
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

    await sendResultEmail({ userId: verificationRequest.userId, verified: true });

  } else {

    verificationRequest.result = 'no_match';
    verificationRequest.rejectionReason = notes || 'Rejected by admin review';

    await User.findByIdAndUpdate(verificationRequest.userId, { verificationStatus: 'rejected' });
    
    await sendResultEmail({
      userId: verificationRequest.userId,
      verified: false,
      reason: verificationRequest.rejectionReason,
    });
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