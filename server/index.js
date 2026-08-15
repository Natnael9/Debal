import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import healthRoute from './routes/health.route.js';

const PORT = process.env.PORT || 4000;

async function start() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: true, 
    credentials: true,
  });

  await connectDatabase();
  await connectRedis();

  await fastify.register(healthRoute);

;

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