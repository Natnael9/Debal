import { verifyAccessToken } from '../../shared/utils/jwt.util.js';
import User from '../users/users.model.js';
import { getRedisClient } from '../../config/redis.js';

export async function authMiddleware(request, reply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or malformed Authorization header',
    });
  }

  const token = authHeader.slice('Bearer '.length);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Access token is invalid or expired',
    });
  }

  if (payload.type !== 'access') {
    return reply.status(401).send({
      success: false,
      error: 'INVALID_TOKEN_TYPE',
      message: 'Expected an access token',
    });
  }

  const cacheKey = `user_session:${payload.sub}`;
  let user = null;

  try {
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      const cached = await redis.get(cacheKey);
      if (cached) {
        user = JSON.parse(cached);
      }
    }
  } catch {
    // Non-blocking cache fallback
  }

  if (!user) {
    // Fast lean user lookup
    user = await User.findById(payload.sub)
      .select('-passwordHash -refreshTokenHashes -idNumberHash -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (user && !user.suspended) {
      try {
        const redis = getRedisClient();
        if (redis && redis.status === 'ready') {
          await redis.setex(cacheKey, 120, JSON.stringify(user)); // 2-min TTL
        }
      } catch {
        // Cache write fallback
      }
    }
  }

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'USER_NOT_FOUND',
      message: 'The user for this token no longer exists',
    });
  }

  if (user.suspended) {
    return reply.status(403).send({
      success: false,
      error: 'ACCOUNT_SUSPENDED',
      message: 'This account has been suspended',
    });
  }

  request.user = user;
}