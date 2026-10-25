import 'dotenv/config';
import { buildCalendarLink } from '../modules/meetups/calendar-link.util.js';
import Meetup, { Meetup as MeetupModel } from '../modules/meetups/meetups.model.js';
import { proposeMeetup, respondToMeetup, getMeetup } from '../modules/meetups/meetups.service.js';
import { Match } from '../modules/chat/matches.model.js';
import { proposeMeetupHandler, respondToMeetupHandler, getCalendarLinkHandler } from '../modules/meetups/meetups.controller.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=== 1. Testing calendar-link.util.js ===');
  try {
    const link1 = buildCalendarLink({ date: '2026-08-20', time: '14:30', locationNote: 'Bole Mall' });
    assert(link1.includes('calendar.google.com'), 'Link contains google calendar base URL');
    assert(link1.includes('dates=20260820T143000%2F20260820T153000') || link1.includes('dates=20260820T143000/20260820T153000'), 'Correct start/end date encoding for standard time');
    assert(link1.includes('Bole+Mall') || link1.includes('Bole%20Mall'), 'Location note encoded correctly');

    const link2 = buildCalendarLink({ date: '2026-08-20', time: '23:30' });
    assert(link2.includes('20260820T233000') && link2.includes('20260821T003000'), 'Correct date rollover when meeting passes midnight');
  } catch (err) {
    console.error('Calendar link test failed:', err);
    failed++;
  }

  console.log('\n=== 2. Testing meetups.model.js Schema ===');
  try {
    const statusEnum = MeetupModel.schema.path('status').enumValues;
    assert(Array.isArray(statusEnum), 'Meetup status enum is properly defined on Schema');
    assert(statusEnum.includes('proposed') && statusEnum.includes('accepted') && statusEnum.includes('declined') && statusEnum.includes('rescheduled'), 'Contains proposed, accepted, declined, rescheduled');
  } catch (err) {
    console.error('Model schema test failed:', err);
    failed++;
  }

  console.log('\n=== 3. Testing meetups.service.js Logic ===');
  const mockMatchId = '64f1a2b3c4d5e6f7a8b9c0d1';
  const userA = '64f1a2b3c4d5e6f7a8b9c0d2';
  const userB = '64f1a2b3c4d5e6f7a8b9c0d3';
  const userC = '64f1a2b3c4d5e6f7a8b9c0d4';

  const origMatchFindById = Match.findById;
  const origCreate = MeetupModel.create;
  const origFindById = MeetupModel.findById;

  let storedMeetup = null;

  try {
    Match.findById = async (id) => {
      if (id === mockMatchId) {
        return {
          _id: mockMatchId,
          userA,
          userB,
          status: 'accepted'
        };
      }
      return null;
    };

    MeetupModel.create = async (data) => {
      storedMeetup = {
        _id: '64f1a2b3c4d5e6f7a8b9c099',
        ...data,
        save: async function() { return this; }
      };
      return storedMeetup;
    };

    MeetupModel.findById = async (id) => {
      if (storedMeetup && storedMeetup._id === id) {
        return storedMeetup;
      }
      return null;
    };

    // Test proposeMeetup service
    const proposeRes = await proposeMeetup(mockMatchId, userA, {
      date: '2026-08-25',
      time: '15:00',
      locationNote: 'Tomoca Coffee'
    });

    assert(proposeRes.meetup.status === 'proposed', 'Service proposed meetup with status "proposed"');
    assert(proposeRes.otherUserId.toString() === userB, 'Identified recipient userB correctly');

    // Test proposer attempting to accept own proposal
    try {
      await respondToMeetup('64f1a2b3c4d5e6f7a8b9c099', userA, 'accept');
      assert(false, 'Proposer accepting own proposal should throw error');
    } catch (err) {
      assert(err.code === 'CANNOT_RESPOND_TO_OWN_PROPOSAL', 'Correctly throws CANNOT_RESPOND_TO_OWN_PROPOSAL');
    }

    // Test non-participant attempting to respond
    try {
      await respondToMeetup('64f1a2b3c4d5e6f7a8b9c099', userC, 'accept');
      assert(false, 'Non-participant responding should throw error');
    } catch (err) {
      assert(err.code === 'NOT_MATCH_PARTICIPANT', 'Correctly throws NOT_MATCH_PARTICIPANT');
    }

    // Test recipient accepting proposal
    const acceptRes = await respondToMeetup('64f1a2b3c4d5e6f7a8b9c099', userB, 'accept');
    assert(acceptRes.meetup.status === 'accepted', 'Meetup status changed to "accepted"');
    assert(acceptRes.otherUserId.toString() === userA, 'Returns proposer userA as otherUserId');

    // Test getMeetup service
    const fetched = await getMeetup('64f1a2b3c4d5e6f7a8b9c099');
    assert(fetched._id === '64f1a2b3c4d5e6f7a8b9c099', 'getMeetup fetched the document');

  } catch (err) {
    console.error('Service test failed:', err);
    failed++;
  }

  console.log('\n=== 4. Testing meetups.controller.js Handlers ===');
  try {
    let replyStatus = null;
    let replyData = null;

    const mockReply = {
      status: (s) => {
        replyStatus = s;
        return mockReply;
      },
      send: (d) => {
        replyData = d;
        return mockReply;
      }
    };

    // Missing fields check
    await proposeMeetupHandler({ params: { matchId: mockMatchId }, body: { date: '2026-08-25' }, log: console }, mockReply);
    assert(replyStatus === 400 && replyData.error === 'MISSING_FIELDS', 'Returns 400 MISSING_FIELDS when time is omitted');

    // Invalid action check
    replyStatus = null;
    replyData = null;
    await respondToMeetupHandler({ params: { id: '64f1a2b3c4d5e6f7a8b9c099' }, body: { action: 'invalid_action' }, log: console }, mockReply);
    assert(replyStatus === 400 && replyData.error === 'INVALID_ACTION', 'Returns 400 INVALID_ACTION when action is invalid');

    // Calendar Link Handler success check
    replyStatus = null;
    replyData = null;
    await getCalendarLinkHandler({ params: { id: '64f1a2b3c4d5e6f7a8b9c099' }, log: console }, mockReply);
    assert(replyData && replyData.success === true && replyData.data.calendarLink.includes('calendar.google.com'), 'getCalendarLinkHandler returns Google Calendar URL');

    // Calendar Link Handler 404 check
    replyStatus = null;
    replyData = null;
    await getCalendarLinkHandler({ params: { id: 'nonexistent_id' }, log: console }, mockReply);
    assert(replyStatus === 404 && replyData.error === 'MEETUP_NOT_FOUND', 'getCalendarLinkHandler returns 404 for invalid meetup ID');

  } catch (err) {
    console.error('Controller test failed:', err);
    failed++;
  } finally {
    Match.findById = origMatchFindById;
    MeetupModel.create = origCreate;
    MeetupModel.findById = origFindById;
  }

  console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
