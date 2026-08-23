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
  const match = await assertUserInMatch(senderId, matchId);
  const actualMatchId = match._id.toString();
  const partnerId = match.userA.toString() === senderId.toString() ? match.userB : match.userA;

  const sender = await User.findById(senderId).lean();
  const partner = await User.findById(partnerId).lean();

  const senderBlockedPartner = (sender?.blockedUsers || []).some(id => id.toString() === partnerId.toString());
  const partnerBlockedSender = (partner?.blockedUsers || []).some(id => id.toString() === senderId.toString());

  if (senderBlockedPartner || partnerBlockedSender) {
    const err = new Error('Messaging is disabled because a user is blocked.');
    err.code = 'USER_BLOCKED';
    throw err;
  }

  const existingCount = await Message.countDocuments({ matchId: actualMatchId });
  if (existingCount > 0) {
    const partnerMsgCount = await Message.countDocuments({
      matchId: actualMatchId,
      senderId: { $ne: senderId },
    });
    if (partnerMsgCount === 0) {
      const err = new Error('You must wait for the recipient to reply before sending another message.');
      err.code = 'WAITING_FOR_REPLY';
      throw err;
    }
  }

  const message = await Message.create({ matchId: actualMatchId, senderId, content });
  return message;
}

export async function deleteChatHistory(matchId, userId) {
  const match = await assertUserInMatch(userId, matchId);
  const actualMatchId = match._id.toString();
  
  const idsToDelete = [match._id, actualMatchId];
  if (matchId && matchId !== actualMatchId) {
    idsToDelete.push(matchId);
  }

  const result = await Message.deleteMany({
    matchId: { $in: idsToDelete }
  });

  await Meetup.deleteMany({
    matchId: { $in: idsToDelete }
  });

  console.log(`[chat] deleteChatHistory deleted ${result.deletedCount} messages and meetups for match ${actualMatchId}`);
  return { success: true, matchId: actualMatchId, deletedCount: result.deletedCount };
}

export async function deleteMatch(matchId, userId) {
  let match = null;
  try {
    match = await assertUserInMatch(userId, matchId);
  } catch (err) {
    if (err.code === 'MATCH_NOT_FOUND' || err.code === 'INVALID_ID') {
      const userIdStr = userId.toString();
      const matchIdStr = matchId.toString();

      await Message.deleteMany({
        $or: [
          { matchId: matchIdStr },
          { senderId: userIdStr, recipientId: matchIdStr },
          { senderId: matchIdStr, recipientId: userIdStr }
        ]
      });

      await Meetup.deleteMany({
        $or: [
          { matchId: matchIdStr },
          { proposedBy: userIdStr },
          { proposedBy: matchIdStr }
        ]
      });

      return { success: true, matchId: matchIdStr };
    }
    throw err;
  }

  const actualMatchId = match._id.toString();
  const idsToDelete = [match._id, actualMatchId];
  if (matchId && matchId !== actualMatchId) {
    idsToDelete.push(matchId);
  }

  const userAStr = match.userA.toString();
  const userBStr = match.userB.toString();

  await Message.deleteMany({
    $or: [
      { matchId: { $in: idsToDelete } },
      { senderId: userAStr, recipientId: userBStr },
      { senderId: userBStr, recipientId: userAStr }
    ]
  });

  await Meetup.deleteMany({
    $or: [
      { matchId: { $in: idsToDelete } },
      { proposedBy: userAStr },
      { proposedBy: userBStr }
    ]
  });

  await MatchRequest.deleteMany({
    $or: [
      { fromUser: match.userA, toUser: match.userB },
      { fromUser: match.userB, toUser: match.userA }
    ]
  });

  await Match.findByIdAndDelete(match._id);
  console.log(`[chat] deleteMatch removed match ${actualMatchId}`);
  return { success: true, matchId: actualMatchId };
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

  if (!matches || matches.length === 0) {
    return [];
  }

  // Fetch online users from Redis with a fast timeout
  let onlineSet = new Set();
  try {
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      const onlineList = await Promise.race([
        redis.smembers('online_users'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 50)),
      ]);
      onlineSet = new Set(onlineList || []);
    }
  } catch (e) {
    console.warn('[chat] Redis online_users query warning:', e.message);
  }

  const filteredMatches = matches.filter((m) => {
    const userAId = m.userA?._id?.toString();
    const partner = userAId === userId.toString() ? m.userB : m.userA;
    return !!partner;
  });

  if (filteredMatches.length === 0) {
    return [];
  }

  const matchIds = filteredMatches.map((m) => m._id);

  // 1. Bulk aggregate last message for each match in a single query
  const lastMessages = await Message.aggregate([
    { $match: { matchId: { $in: matchIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$matchId',
        content: { $first: '$content' },
        createdAt: { $first: '$createdAt' },
      },
    },
  ]);
  const lastMsgMap = new Map(lastMessages.map((msg) => [msg._id.toString(), msg]));

  // 2. Bulk aggregate unread message counts for each match in a single query
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        matchId: { $in: matchIds },
        readAt: null,
      },
    },
    {
      $group: {
        _id: { matchId: '$matchId', senderId: '$senderId' },
        count: { $sum: 1 },
      },
    },
  ]);
  const unreadMap = new Map(
    unreadCounts.map((u) => [`${u._id.matchId.toString()}_${u._id.senderId.toString()}`, u.count])
  );

  // 3. Bulk aggregate latest meetup for each match in a single query
  const latestMeetups = await Meetup.aggregate([
    { $match: { matchId: { $in: matchIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$matchId',
        doc: { $first: '$$ROOT' },
      },
    },
  ]);
  const meetupMap = new Map(latestMeetups.map((m) => [m._id.toString(), m.doc]));

  const results = filteredMatches.map((m) => {
    const userAId = m.userA?._id?.toString();
    const partner = userAId === userId.toString() ? m.userB : m.userA;
    const partnerId = partner._id.toString();
    const matchIdStr = m._id.toString();

    const isBlockedByMe = blockedIds.has(partnerId);
    const isBlockedByPartner = (partner.blockedUsers || []).some(
      (id) => id.toString() === userId.toString()
    );
    const isBlocked = isBlockedByMe || isBlockedByPartner;

    const lastMsg = lastMsgMap.get(matchIdStr);
    const unreadCount = unreadMap.get(`${matchIdStr}_${partnerId}`) || 0;
    const latestMeetup = meetupMap.get(matchIdStr);

    return {
      id: matchIdStr,
      matchId: matchIdStr,
      userId: partnerId,
      name: partner?.name || 'Chat Partner',
      avatarUrl: partner?.photoUrl || partner?.avatarUrl || '',
      avatarText: (partner?.name || 'C')[0].toUpperCase(),
      isOnline: onlineSet.has(partnerId),
      isBlocked: isBlocked,
      isBlockedByMe: isBlockedByMe,
      isBlockedByPartner: isBlockedByPartner,
      lastMessage: lastMsg ? lastMsg.content : '',
      time: lastMsg
        ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      unreadCount: unreadCount,
      user: partner,
      meetup: latestMeetup || { status: 'none' },
    };
  });

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