import { Server } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt.utils.js';
import { User } from '../users/users.model.js';
import { getRedisClient } from '../../config/redis.js';
import {
  assertUserInMatch,
  saveMessage,
  markMessageRead,
  getOtherParticipant,
} from './chat.service.js';

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

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[chat] user ${userId} connected (${socket.id})`);

    socket.join(`user:${userId}`);

    const redis = getRedisClient();
    const subscriber = redis.duplicate();

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

    subscriber.subscribe(`user:${userId}`).catch((err) => {
      console.error(`[chat] Redis subscribe error for user ${userId}:`, err.message);
    });

    // ---- chat:join_match ----
    socket.on('chat:join_match', async ({ matchId }, callback) => {
      try {
        await assertUserInMatch(userId, matchId);
        socket.join(`match:${matchId}`);
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, error: err.code || 'JOIN_FAILED', message: err.message });
      }
    });

    // ---- chat:send_message ----
    socket.on('chat:send_message', async ({ matchId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          return callback?.({ success: false, error: 'EMPTY_MESSAGE' });
        }

        const match = await assertUserInMatch(userId, matchId);
        const message = await saveMessage(matchId, userId, content.trim());

        io.to(`match:${matchId}`).emit('chat:new_message', { matchId, message });

        const otherUserId = getOtherParticipant(match, userId).toString();
        await redis.publish(
          `user:${otherUserId}`,
          JSON.stringify({ event: 'chat:new_message', data: { matchId, message } })
        );

        callback?.({ success: true, data: { message } });
      } catch (err) {
        callback?.({ success: false, error: err.code || 'SEND_FAILED', message: err.message });
      }
    });

    // ---- chat:typing_start / chat:typing_stop ----
    socket.on('chat:typing_start', ({ matchId }) => {
      socket.to(`match:${matchId}`).emit('chat:user_typing', { matchId, userId, typing: true });
    });

    socket.on('chat:typing_stop', ({ matchId }) => {
      socket.to(`match:${matchId}`).emit('chat:user_typing', { matchId, userId, typing: false });
    });

    // ---- chat:mark_read ----
    socket.on('chat:mark_read', async ({ matchId, messageId }, callback) => {
      try {
        await assertUserInMatch(userId, matchId);
        const message = await markMessageRead(matchId, messageId, userId);
        io.to(`match:${matchId}`).emit('chat:message_read', { matchId, messageId: message._id });
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, error: err.code || 'MARK_READ_FAILED', message: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[chat] user ${userId} disconnected`);
      subscriber.unsubscribe(`user:${userId}`).catch(() => {});
      subscriber.quit().catch(() => {});
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