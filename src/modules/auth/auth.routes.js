const controller = require('./auth.controller');

async function authRoutes(fastify) {
  fastify.post('/register', controller.register);
  fastify.post('/login', controller.login);
  fastify.post('/refresh', controller.refresh);
}

module.exports = authRoutes;