import { isDatabaseHealthy } from '../config/database.js';
import { isRedisHealthy } from '../config/redis.js';

export default async function healthRoute(fastify) {
  fastify.get('/health', async (request, reply) => {
    const dbOk = isDatabaseHealthy();
    const redisOk = await isRedisHealthy();
    const allOk = dbOk && redisOk;

    return reply.status(dbOk ? 200 : 503).send({
      status: allOk ? 'ok' : 'degraded',
      services: {
        mongodb: dbOk ? 'connected' : 'disconnected',
        redis: redisOk ? 'connected' : 'disconnected',
      },
      timestamp: new Date().toISOString(),
    });
  });
}