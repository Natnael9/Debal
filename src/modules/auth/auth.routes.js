const controller = require('./auth.controller');

async function authRoutes(fastify) {
  fastify.post('/register', controller.register);
}

module.exports = authRoutes;

/**
 * Register in app.js / server bootstrap, e.g.:
 *
 *   const authRoutes = require('./modules/auth/auth.routes');
 *   fastify.register(authRoutes, { prefix: '/api/v1/auth' });
 *
 * (Robel's job today, in his server-bootstrap task — check with him that
 * this got registered.)
 */