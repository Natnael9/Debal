// BullMQ Queue disabled for now (Redis commented out)
import { getRedisClient } from '../../config/redis.js';

export const notificationQueue = {
  add: async () => {},
  getJob: async () => null,
  on: () => {},
};

const PRESENCE_DEBOUNCE_MS = 2 * 60 * 1000;
const pendingKey = (userId) => `pending-notifications:${userId}`;

async function enqueueNewMatchEmail({ userId, matchId }) {
  // Queue disabled for now
}

async function enqueueMeetupUpdateEmail({ userId, meetupId, summary }) {
  // Queue disabled for now
}

async function cancelPendingEmailsForUser(userId) {
  // Queue disabled for now
}

async function enqueueVerificationResultEmail({ userId, verified, reason }) {
  // Queue disabled for now
}

async function enqueueReportStatusUpdateEmail({ userId, reportId, status }) {
  // Queue disabled for now
}

export {
  enqueueNewMatchEmail,
  enqueueMeetupUpdateEmail,
  cancelPendingEmailsForUser,
  enqueueVerificationResultEmail,
  enqueueReportStatusUpdateEmail,
};
