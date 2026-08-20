import { googleRedirectHandler, googleCallbackHandler } from './google-oauth.controller.js';

export default async function googleOauthRoutes(fastify) {
  fastify.get('/api/v1/auth/google', googleRedirectHandler);
  fastify.get('/api/v1/auth/google/callback', googleCallbackHandler);
}
