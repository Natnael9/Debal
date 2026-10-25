import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in .env');
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: 'access',
      questionnaireCompleted: user.questionnaireCompleted,
      verificationStatus: user.verificationStatus,
      suspended: user.suspended,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

export function signRefreshToken(user, rememberMe = false) {
  return jwt.sign(
    { sub: user._id.toString(), type: 'refresh' },
    REFRESH_SECRET,
    { expiresIn: rememberMe ? '30d' : REFRESH_EXPIRY }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days, in seconds


export function setRefreshTokenCookie(reply, refreshToken, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : REFRESH_COOKIE_MAX_AGE;
  reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge,
  });
}

export function clearRefreshTokenCookie(reply) {
  reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
}