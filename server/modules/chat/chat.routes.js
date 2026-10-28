import mongoose from 'mongoose';
import { authMiddleware } from '../auth/auth.middleware.js';
import { requireFullAccess } from '../../shared/middleware/require-full-access.middleware.js';
import {
  assertUserInMatch,
  getMessages,
  getUserMatches,
  saveMessage,
  markAllMessagesRead,
  getOtherParticipant,
  deleteChatHistory,
  deleteMatch,
} from './chat.service.js';
import { User } from '../users/users.model.js';
import { MatchRequest } from '../matchmaking/matchrequest.model.js';
import { getIO } from './chat.gateway.js';

export default async function chatRoutes(fastify) {
  // GET /api/v1/matches -> Get active conversations for the logged-in user
  fastify.get(
    '/api/v1/matches',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      try {
        const matches = await getUserMatches(request.user._id);
        return reply.send({ success: true, data: { matches } });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );

  // GET /api/v1/matches/:matchId/messages -> Get messages for a match
  fastify.get(
    '/api/v1/matches/:matchId/messages',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      const { matchId } = request.params;
      const { before, limit } = request.query;

      try {
        const match = await assertUserInMatch(request.user._id, matchId);
        const actualMatchId = match._id.toString();
        const messages = await getMessages(actualMatchId, {
          before,
          limit: limit ? parseInt(limit, 10) : 50,
        });

        return reply.send({ success: true, data: { messages, matchId: actualMatchId } });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        if (err.code === 'NOT_MATCH_PARTICIPANT') {
          return reply.status(403).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );

  // POST /api/v1/matches/:matchId/messages -> Send message via REST API
  fastify.post(
    '/api/v1/matches/:matchId/messages',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      const { matchId } = request.params;
      const { content } = request.body || {};

      if (!content || !content.trim()) {
        return reply.status(400).send({ success: false, error: 'EMPTY_MESSAGE' });
      }

      try {
        const match = await assertUserInMatch(request.user._id, matchId);
        const actualMatchId = match._id.toString();
        const userId = request.user._id.toString();
        const otherUserId = getOtherParticipant(match, userId).toString();

        // Check blocks
        const hasBlocked = request.user.blockedUsers?.some(id => id.toString() === otherUserId);
        const otherUser = await User.findById(otherUserId);
        const gotBlocked = otherUser?.blockedUsers?.some(id => id.toString() === userId);

        if (hasBlocked || gotBlocked) {
          return reply.status(403).send({ success: false, error: 'USER_BLOCKED', message: 'You cannot message this user.' });
        }

        const message = await saveMessage(actualMatchId, userId, content.trim());
        const payloadData = { matchId: actualMatchId, message };

        // Broadcast over Socket.IO if available
        try {
          const io = getIO();
          io.to(`match:${actualMatchId}`).emit('chat:new_message', payloadData);
          if (matchId !== actualMatchId) {
            io.to(`match:${matchId}`).emit('chat:new_message', payloadData);
          }
          io.to(`user:${otherUserId}`).emit('chat:new_message', payloadData);
          io.to(`user:${userId}`).emit('chat:new_message', payloadData);

          // When a person chats back after receiving a request, mark connection as connected/accepted!
          const uOid1 = new mongoose.Types.ObjectId(String(otherUserId));
          const uOid2 = new mongoose.Types.ObjectId(String(userId));

          const pendingRequest = await MatchRequest.findOneAndUpdate(
            {
              $or: [
                { fromUser: uOid1, toUser: uOid2 },
                { fromUser: uOid2, toUser: uOid1 },
                { fromUser: otherUserId, toUser: userId },
                { fromUser: userId, toUser: otherUserId },
              ],
              status: 'pending',
            },
            { status: 'accepted' },
            { new: true }
          );

          if (pendingRequest) {
            const connectPayloadForOther = {
              matchId: actualMatchId,
              userId: userId,
              partnerId: userId,
              status: 'connected',
            };
            const connectPayloadForSelf = {
              matchId: actualMatchId,
              userId: otherUserId,
              partnerId: otherUserId,
              status: 'connected',
            };
            io.to(`user:${otherUserId}`).emit('match:accepted', connectPayloadForOther);
            io.to(`user:${userId}`).emit('match:accepted', connectPayloadForSelf);
          }
        } catch (e) {
          // Socket.IO might not be initialized yet
        }

        return reply.status(201).send({ success: true, data: { message } });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        if (err.code === 'NOT_MATCH_PARTICIPANT') {
          return reply.status(403).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: err.message });
      }
    }
  );

  // POST /api/v1/matches/:matchId/read -> Mark messages in a match as read
  fastify.post(
    '/api/v1/matches/:matchId/read',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      const { matchId } = request.params;
      try {
        const result = await markAllMessagesRead(matchId, request.user._id);

        try {
          const io = getIO();
          io.to(`match:${result.matchId}`).emit('chat:message_read', { matchId: result.matchId });
        } catch (e) {}

        return reply.send({ success: true, data: result });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );

  // DELETE /api/v1/matches/:matchId/messages -> Delete chat history for a match
  fastify.delete(
    '/api/v1/matches/:matchId/messages',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      const { matchId } = request.params;
      try {
        const result = await deleteChatHistory(matchId, request.user._id);

        try {
          const io = getIO();
          io.to(`match:${result.matchId}`).emit('chat:history_cleared', { matchId: result.matchId });
          io.to(`match:${result.matchId}`).emit('chat:meetup_update', { matchId: result.matchId, meetup: { status: 'none' } });
        } catch (e) {}

        return reply.send({ success: true, data: result });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        if (err.code === 'NOT_MATCH_PARTICIPANT') {
          return reply.status(403).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );

  // DELETE /api/v1/matches/:matchId -> Delete match completely
  fastify.delete(
    '/api/v1/matches/:matchId',
    { preHandler: [authMiddleware, requireFullAccess] },
    async (request, reply) => {
      const { matchId } = request.params;
      try {
        const result = await deleteMatch(matchId, request.user._id);

        try {
          const io = getIO();
          io.to(`match:${result.matchId}`).emit('chat:match_deleted', { matchId: result.matchId });
          io.to(`match:${result.matchId}`).emit('chat:meetup_update', { matchId: result.matchId, meetup: { status: 'none' } });
        } catch (e) {}

        return reply.send({ success: true, data: result });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        if (err.code === 'NOT_MATCH_PARTICIPANT') {
          return reply.status(403).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );
}