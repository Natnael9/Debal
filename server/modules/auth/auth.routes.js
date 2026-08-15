const controller = require('./auth.controller');
const { authRateLimiter } = require('../../shared/middleware/rate-limiter.middleware');

const rateLimit = authRateLimiter(); // 10 req / 15 min per IP, per FR-1.6

async function authRoutes(fastify) {
  fastify.post('/register', { preHandler: rateLimit }, controller.register);
  fastify.post('/login', { preHandler: rateLimit }, controller.login);
  fastify.post('/refresh', { preHandler: rateLimit }, controller.refresh);
  fastify.post('/logout', controller.logout); // no rate limit needed — requires an existing session
}

module.exports = authRoutes;