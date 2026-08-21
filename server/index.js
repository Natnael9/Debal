import './config/dns.js';
import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import healthRoute from './routes/health.route.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import verificationRoutes from './modules/verification/verification.routes.js';
import { initChatGateway } from './modules/chat/chat.gateway.js';
import chatRoutes from './modules/chat/chat.routes.js';
import meetupsRoutes from './modules/meetups/meetups.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import bookmarksRoutes from './modules/bookmarks/bookmarks.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import { startModerationWorker } from './modules/moderation/moderation.worker.js';
import { startNotificationWorker } from './modules/notifications/notification.worker.js';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes.js';
import moderationRoutes from './modules/moderation/moderation.routes.js';
import googleOauthRoutes from './modules/auth/google-oauth.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import blocksRoutes from './modules/reports/blocks.routes.js';


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
  await fastify.register(googleOauthRoutes);
  await fastify.register(usersRoutes);
  await fastify.register(verificationRoutes);
  await fastify.register(reportRoutes, { prefix: '/api/v1/reports' });
  await fastify.register(blocksRoutes, { prefix: '/api/v1/blocks' });
  await fastify.register(chatRoutes);
  await fastify.register(meetupsRoutes);
  await fastify.register(adminRoutes);

  await fastify.register(bookmarksRoutes);

  await fastify.register(searchRoutes);
  await fastify.register(matchmakingRoutes);
  await fastify.register(moderationRoutes);
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[server] listening on http://localhost:${PORT}`);
  initChatGateway(fastify.server);
  startNotificationWorker();
  startModerationWorker();

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