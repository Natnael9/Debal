import { register, login, refresh, logout, forgotPassword, resetPassword } from './auth.controller.js';

export default async function authRoutes(fastify) {
  // Register a new user
  fastify.post('/api/v1/auth/register', register);

  // Login with email + password
  fastify.post('/api/v1/auth/login', login);

  // Exchange a refresh-token cookie for a new access token
  fastify.post('/api/v1/auth/refresh', refresh);

  // Clear the refresh-token cookie
  fastify.post('/api/v1/auth/logout', logout);

  // Password recovery endpoints
  fastify.post('/api/v1/auth/forgot-password', forgotPassword);
  fastify.post('/api/v1/auth/reset-password', resetPassword);
}
