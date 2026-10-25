import { createReport } from './reports.controller.js';
// Importing the auth middleware from its actual location in the codebase
import { authMiddleware } from '../auth/auth.middleware.js'; 

export default async function reportRoutes(fastify, options) {
  // POST /reports - Create a new report
  // We use preHandler to protect the route with the auth middleware
  fastify.post('/', { preHandler: [authMiddleware] }, createReport);
}