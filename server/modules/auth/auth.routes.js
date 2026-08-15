import * as controller from './auth.controller.js';
import { authRateLimiter } from '../../shared/middleware/rate-limiter.middleware.js';

const rateLimit = authRateLimiter();

async function authRoutes(fastify) {
  fastify.post('/register', { preHandler: rateLimit }, controller.register);
  fastify.post('/login', { preHandler: rateLimit }, controller.login);
  fastify.post('/refresh', { preHandler: rateLimit }, controller.refresh);
  fastify.post('/logout', controller.logout);
}

export default authRoutes;