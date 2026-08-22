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

  const populatedMeetup = await Meetup.findById(meetup._id).populate('proposedBy', 'name email').lean();

  await enqueueMeetupUpdateEmail({
    userId: otherUserId,
    meetupId: meetup._id,
    summary: `A meetup was proposed for ${date} at ${time}.`,
  });

  return { meetup: populatedMeetup, otherUserId };
}

export async function respondToMeetup(meetupId, userId, action) {
  const meetup = await Meetup.findById(meetupId);

  if (!meetup) {
    const err = new Error('Meetup not found');
    err.code = 'MEETUP_NOT_FOUND';
    throw err;
  }

  const match = await assertUserInMatch(userId, meetup.matchId);

  const isProposer = meetup.proposedBy.toString() === userId.toString();

  if (action === 'accept' && isProposer) {
    const err = new Error('You cannot accept your own proposal');
    err.code = 'CANNOT_RESPOND_TO_OWN_PROPOSAL';
    throw err;
  }

  const statusMap = {
    accept: 'accepted',
    decline: 'declined',
    cancel: 'declined',
    reschedule: 'rescheduled',
  };

  meetup.status = statusMap[action] || 'declined';
  meetup.respondedAt = new Date();
  await meetup.save();

  const populatedMeetup = await Meetup.findById(meetup._id).populate('proposedBy', 'name email').lean();

  const otherUserId = getOtherParticipant(match, userId);

  await enqueueMeetupUpdateEmail({
    userId: otherUserId,
    meetupId: meetup._id,
    summary: `Your meetup proposal was ${meetup.status}.`,
  });

  return { meetup: populatedMeetup, otherUserId };
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

export async function deleteMeetup(meetupId, userId) {
  const meetup = await Meetup.findById(meetupId);

  if (!meetup) {
    const err = new Error('Meetup not found');
    err.code = 'MEETUP_NOT_FOUND';
    throw err;
  }

  const match = await assertUserInMatch(userId, meetup.matchId);

  const isProposer = meetup.proposedBy.toString() === userId.toString();
  if (!isProposer) {
    const err = new Error('Only the meetup creator can remove this meetup');
    err.code = 'ONLY_CREATOR_CAN_REMOVE_MEETUP';
    throw err;
  }

  const matchId = meetup.matchId;

  // Delete all meetup records for this match from history
  await Meetup.deleteMany({ matchId });

  const otherUserId = getOtherParticipant(match, userId);

  return { matchId, otherUserId };
}