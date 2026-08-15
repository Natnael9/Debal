const { registerSchema, loginSchema } = require('./auth.validator');
const {
  registerUser,
  loginUser,
  refreshTokens,
  AuthError,
} = require('./auth.service');

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

async function login(request, reply) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(422).send({ error: parsed.error.flatten() });
  }

  try {
    const { accessToken, refreshToken, user } = await loginUser(parsed.data);
    reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    return reply.code(200).send({ accessToken, user });
  } catch (err) {
    if (err instanceof AuthError) {
      return reply.code(err.statusCode).send({ error: err.message });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'Something went wrong.' });
  }
}

async function refresh(request, reply) {
  const token = request.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    return reply.code(401).send({ error: 'No refresh token provided.' });
  }

  try {
    const { accessToken, refreshToken } = await refreshTokens(token);
    reply.setCookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
    return reply.code(200).send({ accessToken });
  } catch (err) {
    if (err instanceof AuthError) {
      reply.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
      return reply.code(err.statusCode).send({ error: err.message });
    }
    request.log.error(err);
    return reply.code(500).send({ error: 'Something went wrong.' });
  }
}

module.exports = { register, login, refresh };