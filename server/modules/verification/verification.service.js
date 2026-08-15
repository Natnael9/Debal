import { User } from '../users/users.model.js';
import { FaydaSimulatedRecord } from './fayda-simulated.model.js';
import { VerificationRequest } from './verification.model.js';
import { hashIdNumber, encryptIdentity } from './encryption.util.js';

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
    await User.findByIdAndUpdate(userId, {
      idNumberHash,
      verificationStatus: 'pending', // still needs OTP — flips to 'verified' in the OTP task
    });
  } else {
    await User.findByIdAndUpdate(userId, { verificationStatus: 'rejected' });
  }

  return { result, rejectionReason, verificationRequestId: verificationRequest._id };
}