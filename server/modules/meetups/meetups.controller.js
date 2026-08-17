import { proposeMeetup, respondToMeetup, getMeetup } from './meetups.service.js';
import { buildCalendarLink } from './calendar-link.util.js';
import { getIO } from '../chat/chat.gateway.js';
import { getRedisClient } from '../../config/redis.js';

const VALID_ACTIONS = ['accept', 'decline', 'reschedule'];

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
    const meetup = await proposeMeetup(matchId, request.user._id, { date, time, locationNote });

    await pushMeetupUpdate(matchId, request.user._id, meetup);

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

    await pushMeetupUpdate(meetup.matchId, request.user._id, meetup);

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

async function pushMeetupUpdate(matchId, actingUserId, meetup) {
  const io = getIO();
  io.to(`match:${matchId}`).emit('chat:meetup_update', { matchId, meetup });

  const redis = getRedisClient();

}