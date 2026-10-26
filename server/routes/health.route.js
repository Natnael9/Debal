import { isDatabaseHealthy } from '../config/database.js';
import { isRedisHealthy } from '../config/redis.js';

export default async function healthRoute(fastify) {
  const handleHealth = async (request, reply) => {
    // If it's a HEAD request (used by lightweight pingers), reply 200 immediately with 0 bytes body
    if (request.method === 'HEAD') {
      return reply.status(200).send();
    }

    // Quick plain text response if requested (2 bytes body)
    if (request.query?.short === '1' || request.headers.accept === 'text/plain') {
      return reply.type('text/plain').status(200).send('OK');
    }

    const dbOk = isDatabaseHealthy();
    const redisOk = await isRedisHealthy();
    const allOk = dbOk && redisOk;

    return reply
      .header('Cache-Control', 'no-store, no-cache, must-revalidate')
      .status(dbOk ? 200 : 503)
      .send({
        status: allOk ? 'ok' : 'degraded',
        services: {
          mongodb: dbOk ? 'connected' : 'disconnected',
          redis: redisOk ? 'connected' : 'disconnected',
        },
        timestamp: new Date().toISOString(),
      });
  };

  const routes = ['/health', '/api/health', '/api/v1/health'];
  for (const url of routes) {
    fastify.route({
      method: ['GET', 'HEAD'],
      url,
      handler: handleHealth,
    });
  }
}
