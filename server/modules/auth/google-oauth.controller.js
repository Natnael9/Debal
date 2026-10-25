import { generateState, generateCodeVerifier } from 'arctic';
import { createGoogleAuthorizationURL, exchangeGoogleCode } from './google-oauth.strategy.js';
import { findOrCreateGoogleUser } from './auth.service.js';
import { signAccessToken, signRefreshToken, setRefreshTokenCookie } from './jwt.utils.js';

const OAUTH_COOKIE_PATH = '/api/v1/auth/google';
const OAUTH_COOKIE_MAX_AGE = 600; // 10 minutes — just needs to survive the redirect round-trip

export async function googleRedirectHandler(request, reply) {
  const { mock } = request.query || {};
  const isMock = mock === 'true' || process.env.ENABLE_MOCK_OAUTH === 'true' || !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('mock');

  if (isMock) {
    const user = await findOrCreateGoogleUser({
      googleId: 'google_mock_user_123',
      email: 'robelalemayehu838@gmail.com',
      name: 'Robel Alemayehu',
    });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshTokenCookie(reply, refreshToken);
    return reply.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth/callback?accessToken=${encodeURIComponent(accessToken)}`);
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = createGoogleAuthorizationURL(state, codeVerifier);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 'lax', not 'strict' — must survive Google's top-level redirect back
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };

  reply.setCookie('google_oauth_state', state, cookieOpts);
  reply.setCookie('google_oauth_code_verifier', codeVerifier, cookieOpts);

  return reply.redirect(url.toString());
}

export async function googleCallbackHandler(request, reply) {
  const { code, state } = request.query;
  const storedState = request.cookies?.google_oauth_state;
  const codeVerifier = request.cookies?.google_oauth_code_verifier;

  // CSRF check per §11.2 — state must round-trip through the browser unchanged
  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return reply.status(400).send({ success: false, error: 'INVALID_OAUTH_STATE' });
  }

  try {
    const { googleId, email, name } = await exchangeGoogleCode(code, codeVerifier);
    const user = await findOrCreateGoogleUser({ googleId, email, name });

    if (user.suspended) {
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=account_suspended`;
      return reply.redirect(errorUrl);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshTokenCookie(reply, refreshToken);

    reply.clearCookie('google_oauth_state', { path: OAUTH_COOKIE_PATH });
    reply.clearCookie('google_oauth_code_verifier', { path: OAUTH_COOKIE_PATH });

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth/callback?accessToken=${encodeURIComponent(accessToken)}`;
    return reply.redirect(redirectUrl);
  } catch (err) {
    request.log.error(err);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`;
    return reply.redirect(errorUrl);
  }
}
