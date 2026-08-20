import { Meetup } from './meetups.model.js';
import { assertUserInMatch, getOtherParticipant } from '../chat/chat.service.js';
import { enqueueMeetupUpdateEmail } from '../notifications/notification.queue.js';

export async function proposeMeetup(matchId, proposedBy, { date, time, locationNote }) {
  const match = await assertUserInMatch(proposedBy, matchId); // reuses the same guard from chat
  const otherUserId = getOtherParticipant(match, proposedBy);

  const meetup = await Meetup.create({
    matchId,
    proposedBy,
    date,
    time,
    locationNote,
    status: 'proposed',
  });

  await enqueueMeetupUpdateEmail({
    userId: otherUserId,
    meetupId: meetup._id,
    summary: `A meetup was proposed for ${date} at ${time}.`,
  });

  return { meetup, otherUserId };
}

export async function respondToMeetup(meetupId, userId, action) {
  const meetup = await Meetup.findById(meetupId);

  if (!meetup) {
    const err = new Error('Meetup not found');
    err.code = 'MEETUP_NOT_FOUND';
    throw err;
  }

  const match = await assertUserInMatch(userId, meetup.matchId);

 
  if (action !== 'reschedule' && meetup.proposedBy.toString() === userId.toString()) {
    const err = new Error('You cannot accept or decline your own proposal');
    err.code = 'CANNOT_RESPOND_TO_OWN_PROPOSAL';
    throw err;
  }

  const statusMap = { accept: 'accepted', decline: 'declined', reschedule: 'rescheduled' };
  meetup.status = statusMap[action];
  meetup.respondedAt = new Date();
  await meetup.save();
  const otherUserId = getOtherParticipant(match, userId);

  await enqueueMeetupUpdateEmail({
    userId: otherUserId,
    meetupId: meetup._id,
    summary: `Your meetup proposal was ${meetup.status}.`,
  });

  return { meetup, otherUserId };
}

export async function getMeetup(meetupId) {
  const meetup = await Meetup.findById(meetupId);
  if (!meetup) {
    const err = new Error('Meetup not found');
    err.code = 'MEETUP_NOT_FOUND';
    throw err;
  }
  return meetup;
}