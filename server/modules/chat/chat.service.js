import { Match } from './matches.model.js';
import { Message } from './message.model.js';
import { User } from '../users/users.model.js';
import { Meetup } from '../meetups/meetups.model.js';
import { getRedisClient } from '../../config/redis.js';

export async function assertUserInMatch(userId, matchId) {
  if (!matchId || matchId.toString().length !== 24) {
    const err = new Error('Invalid match or target ID');
    err.code = 'INVALID_ID';
    throw err;
  }

  let match = null;

  // 1. Try finding match by Match _id
  match = await Match.findById(matchId);

  // 2. Try finding match by user pair
  if (!match) {
    match = await Match.findOne({
      $or: [
        { userA: userId, userB: matchId },
        { userA: matchId, userB: userId }
      ]
    });
  }

  // 3. Auto-create Match if opening chat with another valid user
  if (!match) {
    const targetUser = await User.findById(matchId);
    if (targetUser && targetUser._id.toString() !== userId.toString()) {
      match = await Match.create({
        userA: userId,
        userB: targetUser._id,
        status: 'active',
      });
      console.log(`[chat] Auto-created Match ${match._id} for ${userId} <-> ${targetUser._id}`);
    }
  }

  if (!match) {
    const err = new Error('Match not found');
    err.code = 'MATCH_NOT_FOUND';
    throw err;
  }

  const isParticipant =
    match.userA.toString() === userId.toString() ||
    match.userB.toString() === userId.toString();

  if (!isParticipant) {
    const err = new Error('You are not a participant in this match');
    err.code = 'NOT_MATCH_PARTICIPANT';
    throw err;
  }

  if (match.status === 'blocked') {
    const err = new Error('This match is no longer active');
    err.code = 'MATCH_BLOCKED';
    throw err;
  }

  return match;
}

export async function saveMessage(matchId, senderId, content) {
  const message = await Message.create({ matchId, senderId, content });
  return message;
}

export async function getMessages(matchId, { before, limit = 50 } = {}) {
  const query = { matchId };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100));

  return messages.reverse();
}

export async function getUserMatches(userId) {
  const currentUser = await User.findById(userId).lean();
  const blockedIds = new Set((currentUser?.blockedUsers || []).map(id => id.toString()));

  const matches = await Match.find({
    $or: [{ userA: userId }, { userB: userId }],
    status: 'active',
  })
    .populate('userA', 'name email photoUrl avatarUrl blockedUsers')
    .populate('userB', 'name email photoUrl avatarUrl blockedUsers')
    .sort({ updatedAt: -1 })
    .lean();

  // Fetch online users from Redis
  let onlineSet = new Set();
  try {
    const redis = getRedisClient();
    if (redis && ['ready', 'connecting', 'connect'].includes(redis.status)) {
      const onlineList = await redis.smembers('online_users');
      onlineSet = new Set(onlineList);
    }
  } catch (e) {
    console.warn('[chat] Redis online_users query warning:', e.message);
  }

  const filteredMatches = matches.filter((m) => {
    const userAId = m.userA?._id?.toString();
    const partner = userAId === userId.toString() ? m.userB : m.userA;
    if (!partner) return false;
    const partnerId = partner._id.toString();
    
    // Check if either user blocked the other
    const currentUserBlockedPartner = blockedIds.has(partnerId);
    const partnerBlockedCurrentUser = partner.blockedUsers?.some(id => id.toString() === userId.toString());
    
    return !currentUserBlockedPartner && !partnerBlockedCurrentUser;
  });

  const results = await Promise.all(
    filteredMatches.map(async (m) => {
      const userAId = m.userA?._id?.toString();
      const partner = userAId === userId.toString() ? m.userB : m.userA;
      const partnerId = partner._id.toString();

      const lastMsg = await Message.findOne({ matchId: m._id })
        .sort({ createdAt: -1 })
        .lean();

      const unreadCount = await Message.countDocuments({
        matchId: m._id,
        senderId: partner._id,
        readAt: null,
      });

      const latestMeetup = await Meetup.findOne({ matchId: m._id })
        .sort({ createdAt: -1 })
        .lean();

      return {
        id:            m._id.toString(),
        matchId:       m._id.toString(),
        userId:        partnerId,
        name:          partner?.name || 'Chat Partner',
        avatarUrl:     partner?.photoUrl || partner?.avatarUrl || '',
        avatarText:    (partner?.name || 'C')[0].toUpperCase(),
        isOnline:      onlineSet.has(partnerId),
        lastMessage:   lastMsg ? lastMsg.content : '',
        time:          lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount:   unreadCount,
        user:          partner,
        meetup:        latestMeetup || { status: 'none' },
      };
    })
  );

  return results;
}

export async function markMessageRead(matchId, messageId, readerId) {
  const message = await Message.findOne({ _id: messageId, matchId });

  if (!message) {
    const err = new Error('Message not found');
    err.code = 'MESSAGE_NOT_FOUND';
    throw err;
  }

  if (message.senderId.toString() === readerId.toString()) {
    return message;
  }

  message.readAt = new Date();
  await message.save();
  return message;
}

export async function markAllMessagesRead(matchId, readerId) {
  const match = await assertUserInMatch(readerId, matchId);
  const actualMatchId = match._id.toString();

  const result = await Message.updateMany(
    {
      matchId: actualMatchId,
      senderId: { $ne: readerId },
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    }
  );

  return { success: true, modifiedCount: result.modifiedCount, matchId: actualMatchId };
}

export function getOtherParticipant(match, userId) {
  return match.userA.toString() === userId.toString() ? match.userB : match.userA;
}