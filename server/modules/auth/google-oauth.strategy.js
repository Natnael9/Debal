import { Google, decodeIdToken } from 'arctic';

const google = new Google(
  process.env.GOOGLE_CLIENT_ID || 'mock_client_id',
  process.env.GOOGLE_CLIENT_SECRET || 'mock_client_secret',
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4001/api/v1/auth/google/callback'
);

export function createGoogleAuthorizationURL(state, codeVerifier) {
  const scopes = ['openid', 'profile', 'email'];
  const url = google.createAuthorizationURL(state, codeVerifier, scopes);
  url.searchParams.set('prompt', 'select_account');
  return url;
}

export async function exchangeGoogleCode(code, codeVerifier) {
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const idToken = tokens.idToken();
  const claims = decodeIdToken(idToken);

  if (claims.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('ID token audience mismatch');
  }

  if (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') {
    throw new Error('ID token issuer mismatch');
  }

  if (!claims.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    googleId: claims.sub,
    email: claims.email,
    name: claims.name,
  };
}
