import { Server } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt.utils.js';
import { User } from '../users/users.model.js';
import { getRedisClient } from '../../config/redis.js';

let io = null;

export function initChatGateway(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('UNAUTHORIZED'));
      }

      const payload = verifyAccessToken(token);

      if (payload.type !== 'access') {
        return next(new Error('INVALID_TOKEN_TYPE'));
      }

      const user = await User.findById(payload.sub);

      if (!user) {
        return next(new Error('USER_NOT_FOUND'));
      }

      if (user.suspended) {
        return next(new Error('ACCOUNT_SUSPENDED'));
      }

      if (!user.questionnaireCompleted) {
        return next(new Error('QUESTIONNAIRE_REQUIRED'));
      }

      if (user.verificationStatus !== 'verified') {
        return next(new Error('VERIFICATION_REQUIRED'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[chat] user ${userId} connected (${socket.id})`);

    socket.join(`user:${userId}`);

    const redis = getRedisClient();
    const subscriber = redis.duplicate({ lazyConnect: false });

    subscriber.on('message', (channel, message) => {
      if (channel === `user:${userId}`) {
        try {
          const payload = JSON.parse(message);
          socket.emit(payload.event, payload.data);
        } catch (err) {
          console.error('[chat] Error parsing Redis pub/sub payload:', err);
        }
      }
    });

    await subscriber.subscribe(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`[chat] user ${userId} disconnected`);
      subscriber.unsubscribe(`user:${userId}`);
      subscriber.quit();
    });
  });

  console.log('[chat] Socket.IO gateway initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initChatGateway() first.');
  }
  return io;
}