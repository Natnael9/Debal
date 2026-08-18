import { verifyAccessToken } from '../../shared/utils/jwt.util.js';
import User from '../users/users.model.js';

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

  const user = await User.findById(payload.sub);

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