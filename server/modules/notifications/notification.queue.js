import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { getRedisClient } from '../../config/redis.js';

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
  ...(process.env.REDIS_URL?.startsWith('rediss://') && { tls: { rejectUnauthorized: false } }),
});

export const notificationQueue = new Queue('notifications', { connection });

// ~2 min, matches the debounce window architecture doc §9.4 describes for email:new-message
const PRESENCE_DEBOUNCE_MS = 2 * 60 * 1000;

const pendingKey = (userId) => `pending-notifications:${userId}`;

/**
 * email:new-match — immediate, no debounce (architecture doc §9.4).
 * Toggleable via user.notificationPreferences.requestAccepted.
 */
async function enqueueNewMatchEmail({ userId, matchId }) {
  await notificationQueue.add('email:new-match', { userId, matchId });
}

/**
 * email:meetup-update — debounced by presence, same pattern the doc describes
 * for email:new-message: if the recipient is online right now, skip the
 * email (they'll see it live in-app). If offline, queue a delayed job; if
 * they reconnect within the window, cancelPendingEmailsForUser() removes it.
 * Toggleable via user.notificationPreferences.meetupUpdate.
 */
async function enqueueMeetupUpdateEmail({ userId, meetupId, summary }) {
  const redisClient = getRedisClient();
  const isOnline = await redisClient.sismember('online_users', userId.toString());
  if (isOnline) {
    return;
  }

  const jobId = `meetup-update_${userId}_${meetupId}_${Date.now()}`;
  await notificationQueue.add(
    'email:meetup-update',
    { userId, meetupId, summary },
    { jobId, delay: PRESENCE_DEBOUNCE_MS }
  );
  await redisClient.sadd(pendingKey(userId), jobId);
  await redisClient.expire(pendingKey(userId), 60 * 10); // safety cleanup
}

/**
 * Cancels any pending debounced emails for a user — call this when they
 * reconnect (chat.gateway.js). Safe to call even if nothing is pending.
 */
async function cancelPendingEmailsForUser(userId) {
  const redisClient = getRedisClient();
  const key = pendingKey(userId);
  const jobIds = await redisClient.smembers(key);

  for (const jobId of jobIds) {
    const job = await notificationQueue.getJob(jobId);
    if (job) {
      const state = await job.getState();
      if (state === 'delayed' || state === 'waiting') {
        await job.remove();
      }
    }
  }
  await redisClient.del(key);
}

/**
 * email:verification-result — immediate, non-toggleable. There's
 * deliberately no notificationPreferences field for this, so it always
 * sends regardless of user settings.
 */
async function enqueueVerificationResultEmail({ userId, verified, reason }) {
  await notificationQueue.add('email:verification-result', { userId, verified, reason });
}
/**
 * email:report-update — immediate, sent when an admin resolves/dismisses a report.
 * Toggleable via user.notificationPreferences.reportStatus (architecture doc).
 */
async function enqueueReportStatusUpdateEmail({ userId, reportId, status }) {
  await notificationQueue.add('email:report-update', { userId, reportId, status });
}
export {
  enqueueNewMatchEmail,
  enqueueMeetupUpdateEmail,
  cancelPendingEmailsForUser,
  enqueueVerificationResultEmail,enqueueReportStatusUpdateEmail,
};