import crypto from 'crypto';
import User from '../users/users.model.js';
import { hashPassword, comparePassword } from './auth.service.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from './jwt.utils.js';
import { sendPasswordResetEmail } from '../notifications/email.util.js';

// POST /api/v1/auth/register
export async function register(request, reply) {
  const { email, password, name, confirmPassword } = request.body;

  if (!email || !password || !name) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'email, password, and name are required',
    });
  }

  if (confirmPassword && password !== confirmPassword) {
    return reply.status(400).send({
      success: false,
      error: 'PASSWORDS_DONT_MATCH',
      message: 'Passwords do not match',
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return reply.status(409).send({
      success: false,
      error: 'EMAIL_TAKEN',
      message: 'An account with that email already exists',
    });
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, name, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshTokenCookie(reply, refreshToken);

  return reply.status(201).send({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        verificationStatus: user.verificationStatus,
        questionnaireCompleted: user.questionnaireCompleted,
      },
    },
  });
}

// POST /api/v1/auth/login
export async function login(request, reply) {
  const { email, password, rememberMe } = request.body;

  if (!email || !password) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'email and password are required',
    });
  }

  // passwordHash is select:false — explicitly select it
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+passwordHash'
  );

  if (!user || !user.passwordHash) {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }

  if (user.suspended) {
    return reply.status(403).send({
      success: false,
      error: 'ACCOUNT_SUSPENDED',
      message: 'This account has been suspended',
    });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, !!rememberMe);
  setRefreshTokenCookie(reply, refreshToken, !!rememberMe);

  return reply.send({
    success: true,
    data: {
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        verificationStatus: user.verificationStatus,
        questionnaireCompleted: user.questionnaireCompleted,
      },
    },
  });
}

// POST /api/v1/auth/refresh
export async function refresh(request, reply) {
  const token = request.cookies?.refreshToken;

  if (!token) {
    return reply.status(401).send({
      success: false,
      error: 'NO_REFRESH_TOKEN',
      message: 'Refresh token cookie missing',
    });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh token is invalid or expired',
    });
  }

  if (payload.type !== 'refresh') {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_TOKEN_TYPE',
      message: 'Expected a refresh token',
    });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return reply.status(401).send({ success: false, error: 'USER_NOT_FOUND' });
  }

  if (user.suspended) {
    return reply.status(403).send({
      success: false,
      error: 'ACCOUNT_SUSPENDED',
      message: 'This account has been suspended',
    });
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  setRefreshTokenCookie(reply, newRefreshToken);

  return reply.send({ success: true, data: { accessToken: newAccessToken } });
}

// POST /api/v1/auth/logout
export async function logout(request, reply) {
  clearRefreshTokenCookie(reply);
  return reply.send({ success: true, message: 'Logged out successfully' });
}

// POST /api/v1/auth/forgot-password
export async function forgotPassword(request, reply) {
  const { email } = request.body || {};

  if (!email) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_EMAIL',
      message: 'Email address is required',
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return reply.send({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
}

// POST /api/v1/auth/reset-password
export async function resetPassword(request, reply) {
  const { token, newPassword, confirmPassword } = request.body || {};

  if (!token || !newPassword) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Reset token and new password are required',
    });
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return reply.status(400).send({
      success: false,
      error: 'PASSWORDS_DONT_MATCH',
      message: 'Passwords do not match',
    });
  }

  if (newPassword.length < 8) {
    return reply.status(400).send({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters long',
    });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+passwordHash +resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return reply.status(400).send({
      success: false,
      error: 'INVALID_OR_EXPIRED_TOKEN',
      message: 'Password reset token is invalid or has expired.',
    });
  }

  user.passwordHash = await hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return reply.send({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
}
