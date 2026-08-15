const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../users/users.model');
const redisClient = require('../../shared/utils/redis.client');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} = require('../../shared/utils/jwt.util');

const BCRYPT_COST_FACTOR = 12; // per architecture doc §10.3

// Key under which we store the single "currently valid" refresh-token jti
// for a user in Redis. Used for rotation + logout invalidation.
const refreshKey = (userId) => `refresh:${userId}`;

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * POST /auth/register
 * Returns success only — no auto-login, per architecture doc §11.1.
 */
async function registerUser({ email, password, name, acceptedPolicyVersion }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AuthError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  await User.create({
    email,
    passwordHash,
    name,
    privacyPolicyAccepted: {
      version: acceptedPolicyVersion,
      acceptedAt: new Date(),
    },
  });

  return { message: 'Registration successful. Please log in.' };
}

/**
 * POST /auth/login
 * Returns access token + refresh token + a user object the frontend
 * uses to decide where to route (questionnaire vs. dashboard vs. verify).
 */
async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  // Same generic error whether the email doesn't exist or the password is
  // wrong — don't leak which one it was.
  if (!user || !user.passwordHash) {
    throw new AuthError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password.', 401);
  }

  if (user.suspended) {
    throw new AuthError('This account has been suspended.', 403);
  }

  const { accessToken, refreshToken } = await issueTokenPair(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      questionnaireCompleted: user.questionnaireCompleted,
      verificationStatus: user.verificationStatus,
    },
  };
}

/**
 * POST /auth/refresh
 * Rotates the refresh token: the old jti is invalidated and a new
 * access/refresh pair is issued. Rejects reused/old refresh tokens.
 */
async function refreshTokens(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AuthError('Invalid or expired refresh token.', 401);
  }

  const storedJti = await redisClient.get(refreshKey(payload.sub));
  if (!storedJti || storedJti !== payload.jti) {
    // Token reuse or an already-rotated/logged-out token.
    throw new AuthError('Refresh token is no longer valid.', 401);
  }

  const user = await User.findById(payload.sub);
  if (!user || user.suspended) {
    throw new AuthError('Account is not available.', 403);
  }

  const tokens = await issueTokenPair(user);
  return tokens;
}

/**
 * POST /auth/logout
 * Invalidates the stored refresh-token jti so it can no longer be rotated.
 */
async function logoutUser(userId) {
  await redisClient.del(refreshKey(userId));
  return { message: 'Logged out.' };
}

async function issueTokenPair(user) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, jti);

  await redisClient.set(
    refreshKey(user._id.toString()),
    jti,
    'EX',
    REFRESH_TOKEN_TTL_SECONDS
  );

  return { accessToken, refreshToken };
}

module.exports = { registerUser, loginUser, refreshTokens, logoutUser, AuthError };
