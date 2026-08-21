import { Server } from 'socket.io';
import { verifyAccessToken } from '../auth/jwt.utils.js';
import { User } from '../users/users.model.js';
import { getRedisClient } from '../../config/redis.js';
import {
  assertUserInMatch,
  saveMessage,
  markMessageRead,
  getOtherParticipant,
  deleteChatHistory,
  deleteMatch,
} from './chat.service.js';
import { cancelPendingEmailsForUser } from '../notifications/notification.queue.js';

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

      if (process.env.NODE_ENV === 'production' && user.verificationStatus !== 'verified') {
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

    // Redis subscriber setup (safe try/catch)
    let subscriber = null;
    try {
      const redis = getRedisClient();
      if (redis && ['ready', 'connecting', 'connect'].includes(redis.status)) {
        subscriber = redis.duplicate();
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
          console.warn(`[chat] Redis subscribe warning for user ${userId}:`, err.message);
        });
      }
    } catch (e) {
      console.warn(`[chat] Redis pub/sub omitted for user ${userId}:`, e.message);
    }

    // ---- chat:join_match ----
    socket.on('chat:join_match', async ({ matchId }, callback) => {
      try {
        const match = await assertUserInMatch(userId, matchId);
        const actualMatchId = match._id.toString();
        socket.join(`match:${actualMatchId}`);
        socket.join(`match:${matchId}`);
        callback?.({ success: true, matchId: actualMatchId });
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
        const actualMatchId = match._id.toString();
        const otherUserId = getOtherParticipant(match, userId).toString();

        // Check blocks
        const hasBlocked = socket.user.blockedUsers?.some(id => id.toString() === otherUserId);
        const otherUser = await User.findById(otherUserId);
        const gotBlocked = otherUser?.blockedUsers?.some(id => id.toString() === userId);

        if (hasBlocked || gotBlocked) {
          return callback?.({ success: false, error: 'USER_BLOCKED', message: 'You cannot message this user.' });
        }

        const message = await saveMessage(actualMatchId, userId, content.trim());
        const payloadData = { matchId: actualMatchId, message };

        // 1. Direct Socket.IO room broadcast (Guaranteed real-time delivery!)
        io.to(`match:${actualMatchId}`).emit('chat:new_message', payloadData);
        if (matchId !== actualMatchId) {
          io.to(`match:${matchId}`).emit('chat:new_message', payloadData);
        }
        io.to(`user:${otherUserId}`).emit('chat:new_message', payloadData);
        io.to(`user:${userId}`).emit('chat:new_message', payloadData);

        // 2. Redis pub/sub (guarded safely with try/catch)
        try {
          const redis = getRedisClient();
          if (redis && ['ready', 'connecting', 'connect'].includes(redis.status)) {
            const redisPayload = JSON.stringify({ event: 'chat:new_message', data: payloadData });
            await redis.publish(`user:${otherUserId}`, redisPayload);
            await redis.publish(`user:${userId}`, redisPayload);
          }
        } catch (redisErr) {
          console.warn('[chat] Redis publish warning:', redisErr.message);
        }

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

    // ---- chat:delete_history ----
    socket.on('chat:delete_history', async ({ matchId }, callback) => {
      try {
        const result = await deleteChatHistory(matchId, userId);
        io.to(`match:${result.matchId}`).emit('chat:history_cleared', { matchId: result.matchId });
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, error: err.code || 'DELETE_FAILED', message: err.message });
      }
    });

    // ---- chat:delete_match ----
    socket.on('chat:delete_match', async ({ matchId }, callback) => {
      try {
        const result = await deleteMatch(matchId, userId);
        io.to(`match:${result.matchId}`).emit('chat:match_deleted', { matchId: result.matchId });
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, error: err.code || 'DELETE_MATCH_FAILED', message: err.message });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`[chat] user ${userId} disconnected`);
      if (subscriber) {
        try {
          await subscriber.unsubscribe(`user:${userId}`);
          await subscriber.quit();
        } catch (e) {}
      }
      try {
        const redis = getRedisClient();
        if (redis && ['ready', 'connecting', 'connect'].includes(redis.status)) {
          await redis.srem('online_users', userId);
        }
      } catch (e) {}

      io.emit('user:online_status', { userId, isOnline: false });
    });

    // Online status & pending emails cleanup (guarded safely)
    try {
      const redis = getRedisClient();
      if (redis && ['ready', 'connecting', 'connect'].includes(redis.status)) {
        await redis.sadd('online_users', userId);
      }
      await cancelPendingEmailsForUser(userId);
      io.emit('user:online_status', { userId, isOnline: true });
    } catch (e) {
      console.warn('[chat] presence state update warning:', e.message);
    }
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