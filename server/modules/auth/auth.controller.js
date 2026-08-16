import User from '../users/users.model.js';
import { hashPassword, comparePassword } from './auth.service.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from './jwt.utils.js';

// POST /api/v1/auth/register
export async function register(request, reply) {
  const { email, password, name } = request.body;

  if (!email || !password || !name) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'email, password, and name are required',
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
  const { email, password } = request.body;

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
  const refreshToken = signRefreshToken(user);
  setRefreshTokenCookie(reply, refreshToken);

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
