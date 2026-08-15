import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import healthRoute from './routes/health.route.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';

const PORT = process.env.PORT || 4000;

async function start() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(cookie);

  await connectDatabase();
  await connectRedis();

  await fastify.register(healthRoute);
  await fastify.register(authRoutes);
  await fastify.register(usersRoutes);

  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[server] listening on http://localhost:${PORT}`);

  const shutdown = async (signal) => {
    console.log(`[server] received ${signal}, shutting down`);
    await fastify.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});