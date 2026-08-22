import { proposeMeetup, respondToMeetup, getMeetup, deleteMeetup } from './meetups.service.js';
import { buildCalendarLink } from './calendar-link.util.js';
import { getIO } from '../chat/chat.gateway.js';
import { getRedisClient } from '../../config/redis.js';

const VALID_ACTIONS = ['accept', 'decline', 'reschedule', 'cancel'];

export async function proposeMeetupHandler(request, reply) {
  const { matchId } = request.params;
  const { date, time, locationNote } = request.body;

  if (!date || !time) {
    return reply.status(400).send({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'date and time are required',
    });
  }

  try {
    const { meetup, otherUserId } = await proposeMeetup(matchId, request.user._id, { date, time, locationNote });

    await pushMeetupUpdate(matchId, request.user._id, meetup, otherUserId);

    return reply.status(201).send({ success: true, data: { meetup } });
  } catch (err) {
    if (err.code === 'NOT_MATCH_PARTICIPANT' || err.code === 'MATCH_NOT_FOUND') {
      return reply.status(403).send({ success: false, error: err.code, message: err.message });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

export async function respondToMeetupHandler(request, reply) {
  const { id } = request.params;
  const { action } = request.body;

  if (!VALID_ACTIONS.includes(action)) {
    return reply.status(400).send({
      success: false,
      error: 'INVALID_ACTION',
      message: `action must be one of: ${VALID_ACTIONS.join(', ')}`,
    });
  }

  try {
    const { meetup, otherUserId } = await respondToMeetup(id, request.user._id, action);

    await pushMeetupUpdate(meetup.matchId, request.user._id, meetup, otherUserId);

    return reply.send({ success: true, data: { meetup } });
  } catch (err) {
    const knownErrors = ['MEETUP_NOT_FOUND', 'CANNOT_RESPOND_TO_OWN_PROPOSAL'];
    if (knownErrors.includes(err.code)) {
      return reply.status(400).send({ success: false, error: err.code, message: err.message });
    }
    if (err.code === 'NOT_MATCH_PARTICIPANT') {
      return reply.status(403).send({ success: false, error: err.code });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

export async function getCalendarLinkHandler(request, reply) {
  const { id } = request.params;

  try {
    const meetup = await getMeetup(id);
    const link = buildCalendarLink({
      date: meetup.date,
      time: meetup.time,
      locationNote: meetup.locationNote,
    });

    return reply.send({ success: true, data: { calendarLink: link } });
  } catch (err) {
    if (err.code === 'MEETUP_NOT_FOUND') {
      return reply.status(404).send({ success: false, error: err.code });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

export async function deleteMeetupHandler(request, reply) {
  const { id } = request.params;

  try {
    const { matchId, otherUserId } = await deleteMeetup(id, request.user._id);

    const emptyMeetup = { status: 'none' };
    await pushMeetupUpdate(matchId, request.user._id, emptyMeetup, otherUserId);

    return reply.send({ success: true, data: { meetup: emptyMeetup } });
  } catch (err) {
    if (err.code === 'MEETUP_NOT_FOUND') {
      return reply.status(404).send({ success: false, error: err.code });
    }
    if (err.code === 'NOT_MATCH_PARTICIPANT' || err.code === 'ONLY_CREATOR_CAN_REMOVE_MEETUP') {
      return reply.status(403).send({ success: false, error: err.code, message: err.message });
    }
    request.log.error(err);
    return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
  }
}

async function pushMeetupUpdate(matchId, actingUserId, meetup, otherUserId) {
  try {
    const io = getIO();
    io.to(`match:${matchId}`).emit('chat:meetup_update', { matchId, meetup });

    if (otherUserId) {
      const redis = getRedisClient();
      await redis.publish(
        `user:${otherUserId.toString()}`,
        JSON.stringify({ event: 'chat:meetup_update', data: { matchId, meetup } })
      );
    }
  } catch (err) {
    console.error('[meetups] Error pushing meetup update:', err);
  }
}