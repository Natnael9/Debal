import { registerSchema, loginSchema } from './auth.validator.js';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  AuthError,
} from './auth.service.js';
import { verifyRefreshToken } from '../../shared/utils/jwt.util.js';

const REFRESH_COOKIE_NAME = 'refreshToken';
const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function register(request, reply) {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(422).send({ error: parsed.error.flatten() });
  }
  try {
    const result = await registerUser(parsed.data);
    return reply.code(201).send(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'Something went wrong.' });
  }
}

module.exports = { register };
