import { authenticator } from 'otplib';
import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 10;

authenticator.options = { digits: 6, step: OTP_EXPIRY_MINUTES * 60 };

export function generateOtp() {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  return { otp, expiresAt };
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function isOtpExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}