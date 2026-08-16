import { Match } from './matches.model.js';
import { Message } from './message.model.js';

export async function assertUserInMatch(userId, matchId) {
  const match = await Match.findById(matchId);

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

  return messages.reverse(); // oldest-first for rendering
}

export async function markMessageRead(matchId, messageId, readerId) {
  const message = await Message.findOne({ _id: messageId, matchId });

  if (!message) {
    const err = new Error('Message not found');
    err.code = 'MESSAGE_NOT_FOUND';
    throw err;
  }

  // Only the recipient marks it read, not the sender
  if (message.senderId.toString() === readerId.toString()) {
    return message;
  }

  message.readAt = new Date();
  await message.save();
  return message;
}


export function getOtherParticipant(match, userId) {
  return match.userA.toString() === userId.toString() ? match.userB : match.userA;
}